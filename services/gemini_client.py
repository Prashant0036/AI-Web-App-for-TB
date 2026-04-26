"""
Shared Gemini client utility.
Implements a model fallback chain + exponential backoff so that
quota exhaustion on one model automatically retries on the next.

Fallback order (all free-tier eligible):
  1. gemini-2.0-flash        – Primary (fast & smart)
  2. gemini-3-flash-preview  – High-priority fallback
  3. gemini-2.0-flash-lite   – Efficient fallback
  4. gemini-flash-latest     – Reliable backup
"""

import asyncio
import time
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Ordered list of models to try (first available wins)
FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-3-flash-preview",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
]

MAX_RETRIES = 1          # Reduced to 1 for faster failover
RETRY_BASE_DELAY = 1     # Reduced to 1s for faster recovery


def _is_quota_error(exc: Exception) -> bool:
    """Return True when the exception is a 429 / quota-exhausted error."""
    msg = str(exc).lower()
    return "429" in msg or "resource_exhausted" in msg or "quota" in msg


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    return genai.Client(api_key=api_key)


async def generate_with_fallback(
    contents,
    config: types.GenerateContentConfig | None = None,
) -> str:
    """
    Call Gemini with automatic model fallback and per-model retry.

    Parameters
    ----------
    contents : str | list
        The prompt string or list of Part objects.
    config : GenerateContentConfig, optional
        Extra config (tools, etc.).  Applied to every model attempt.

    Returns
    -------
    str  – the raw text response from the first model that succeeds.

    Raises
    ------
    Exception – if all models and all retries are exhausted.
    """
    client = get_client()
    last_exc: Exception | None = None

    for model in FALLBACK_MODELS:
        for attempt in range(MAX_RETRIES + 1):
            try:
                kwargs = dict(model=model, contents=contents)
                if config is not None:
                    kwargs["config"] = config

                response = client.models.generate_content(**kwargs)
                if attempt > 0 or model != FALLBACK_MODELS[0]:
                    print(f"[GeminiClient] Success with model={model} attempt={attempt}")
                return response.text

            except Exception as exc:
                last_exc = exc
                if _is_quota_error(exc):
                        # If there are more models in the list, skip waiting and try next model immediately
                        is_last_model = (model == FALLBACK_MODELS[-1])
                        if not is_last_model:
                            print(f"[GeminiClient] Quota hit on {model}. Skipping wait and trying next model…")
                            break
                        
                        if attempt < MAX_RETRIES:
                            delay = RETRY_BASE_DELAY * (2 ** attempt)
                            print(
                                f"[GeminiClient] Quota hit on {model} (Final Fallback). "
                                f"Retrying in {delay}s…"
                            )
                            await asyncio.sleep(delay)
                        else:
                            print(f"[GeminiClient] Quota exhausted on final model {model}.")
                            break
                else:
                    # If it's a 404 NOT_FOUND, skip to the next model
                    if "404" in str(exc) or "not_found" in str(exc).lower():
                        print(f"[GeminiClient] Model {model} not found (404). Trying next model…")
                        break
                    # Otherwise, it's a different error – don't retry, don't fall back
                    raise

    raise Exception(
        f"All Gemini models exhausted quota. Last error: {last_exc}"
    )
