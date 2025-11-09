# services/processor.py
import copy
import asyncio
from config.db import mycollection
from LLM.handle_user_prompt import get_llm_res

def _run_async(coro):
    """Run async coroutine synchronously using a fresh loop (safe on Cloud)."""
    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    finally:
        try:
            loop.close()
        except Exception:
            pass

def process_patient_sync(data: dict) -> dict:
    """
    Insert into DB and call LLM; returns a dict similar to previous FastAPI response.
    """
    data_copy = copy.deepcopy(data)

    # Insert into MongoDB
    try:
        result = mycollection.insert_one(data_copy)
        inserted_id = str(result.inserted_id)
    except Exception as e:
        return {
            "message": "DB insert failed",
            "inserted_id": None,
            "user_info": data_copy,
            "llm_response": {"score": 0, "test": "error", "tips": f"DB error: {e}"},
        }

    # Call LLM (async) safely from sync code
    try:
        llm_response = _run_async(get_llm_res(data_copy))
    except Exception as e:
        llm_response = {"score": 0, "test": "error", "tips": f"LLM error: {e}"}

    return {
        "message": "Data processed",
        "inserted_id": inserted_id,
        "user_info": data_copy,
        "llm_response": llm_response,
    }
