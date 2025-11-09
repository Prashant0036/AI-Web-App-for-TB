# LLM/handle_user_prompt.py
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
from google import genai
from google.genai import types

def _make_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment.")
    return genai.Client(api_key=api_key)

async def generate(prompt: str) -> str:
    client = _make_client()
    model = "gemini-flash-latest"
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    tools = [types.Tool(googleSearch=types.GoogleSearch())]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=-1),
        tools=tools,
    )
    for chunk in client.models.generate_content_stream(
        model=model, contents=contents, config=generate_content_config
    ):
        return chunk.text

async def get_llm_res(data: dict) -> dict:
    prompt = f"""You are a TB consultant. Return JSON only, no extra text. Has exactly keys: "score","test","tips".
score: integer 0-100 estimating TB risk.
test: recommended test string or "No test".
tips: 1-2 short tips.

Patient info: {json.dumps(data, ensure_ascii=False)}
"""
    try:
        response_text = await generate(prompt)
    except Exception as e:
        return {"score": 0, "test": "error", "tips": f"LLM call failed: {e}"}

    match = re.search(r"\{.*\}", response_text or "", re.DOTALL)
    if not match:
        return {"score": 0, "test": "No test", "tips": "No JSON from LLM."}
    try:
        parsed = json.loads(match.group(0))
        return parsed
    except Exception:
        return {"score": 0, "test": "No test", "tips": "Failed to parse JSON from LLM."}
