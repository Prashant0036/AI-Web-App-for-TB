from fastapi import APIRouter, Request
from config.db import mycollection
from LLM.handle_user_prompt import get_llm_res
import copy
router = APIRouter()

@router.post("/process")
async def process_data(request: Request):
    try:
        data = await request.json()
       
        # print("Received data:", data)
        print("Data Before",data)
        data_copy = copy.deepcopy(data)
        result = mycollection.insert_one(data_copy)
        print("Inserted in db")

        llm_response = await get_llm_res(data_copy)
        # print("abovve return in process.py")
        # llm_response['_id'] = str(llm_response['_id']) #converted into str from object
        # print(type(llm_response))
        print("llm - response",llm_response)
        # print("Data after : ",data)



        return {
       "message": "Data received successfully",
       "inserted_id": str(result.inserted_id),
       "user_info":data,
       "llm_response" : llm_response
        }

    except Exception as e:
        print("Backend Error:", e)
        # Always return valid JSON, even on failure
        return {"error": str(e)}
