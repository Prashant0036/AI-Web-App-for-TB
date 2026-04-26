from fastapi import APIRouter, Request, UploadFile, File, HTTPException, Header
from bson import ObjectId
from config.db import mycollection
from services.symptom_analyzer import analyze_symptoms
from services.report_analyzer import analyze_medical_report
from services.tb_classifier import predict_tb
from utils.auth_utils import decode_token
from datetime import datetime

router = APIRouter()

def get_current_user_email(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    return payload.get("sub") if payload else None

@router.post("/process")
async def process_data(request: Request, authorization: str = Header(None)):
    """
    Endpoint for TB Symptom Checker.
    Analyzes patient data and returns a risk score + recommendations.
    """
    try:
        data = await request.json()
        user_email = get_current_user_email(authorization) or data.get('user_email')
        
        print("Processing assessment for:", data.get('name', 'Unknown'))
        
        # Analyze symptoms using Gemini service
        analysis_result = await analyze_symptoms(data)
        
        # Standardize record for history
        record = {
            "user_email": user_email,
            "timestamp": datetime.utcnow(),
            "type": "symptom_assessment",
            "formData": data,
            "result": analysis_result
        }
        mycollection.insert_one(record)
        
        return {
            "message": "Assessment complete",
            "risk_score": analysis_result.get("score", 0),
            "llm_response": analysis_result
        }

    except Exception as e:
        print("Backend Error in /process:", e)
        return {"error": str(e), "risk_score": 0}

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...), authorization: str = Header(None)):
    """
    Endpoint for Medical Report Analysis.
    Handles PDF lab results and Image-based X-rays.
    """
    try:
        user_email = get_current_user_email(authorization)
        file_bytes = await file.read()
        mime_type = file.content_type
        
        print(f"Analyzing report: {file.filename} ({mime_type}) for {user_email}")

        # 1. Base Analysis using Gemini (Multimodal)
        prompt_type = "x-ray" if "image" in mime_type else "general"
        analysis = await analyze_medical_report(file_bytes, mime_type, prompt_type)

        # 2. If it's an image (X-ray), also run local TFLite Classifier
        if "image" in mime_type:
            custom_model_result = await predict_tb(file_bytes)
            analysis["custom_model"] = custom_model_result
            
            if "error" not in custom_model_result:
                if custom_model_result["label"] == "Tuberculosis" and custom_model_result["confidence"] > 0.8:
                    analysis["risk_score"] = max(analysis.get("risk_score", 0), 85)

        # 3. Save to MongoDB
        if user_email:
            record = {
                "user_email": user_email,
                "timestamp": datetime.utcnow(),
                "type": "report_analysis",
                "filename": file.filename,
                "result": {
                    "score": analysis.get("risk_score", 0),
                    "tips": "Analysis complete.",
                    "test": f"AI Report: {file.filename}",
                    "analysis_details": analysis,
                    "diet": analysis.get("diet", "N/A")
                }
            }
            mycollection.insert_one(record)

        return analysis

    except Exception as e:
        print("Backend Error in /analyze-report:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(authorization: str = Header(None)):
    """
    Retrieve clinical history for the logged-in user.
    """
    try:
        user_email = get_current_user_email(authorization)
        if not user_email:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid token provided")
        
        print(f"Fetching history for: {user_email}")
        
        # Fetch records from MongoDB (synchronous pymongo)
        cursor = mycollection.find({"user_email": user_email}).sort("timestamp", -1)
        history = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
                doc["timestamp"] = doc["timestamp"].isoformat()
            history.append(doc)
            
        return history

    except Exception as e:
        print("Backend Error in /history:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shared-report/{report_id}")
async def get_shared_report(report_id: str):
    """
    Publicly accessible endpoint to view a specific assessment via its ID.
    Used for the sharing feature.
    """
    try:
        if not ObjectId.is_valid(report_id):
            raise HTTPException(status_code=400, detail="Invalid report ID format")
            
        doc = mycollection.find_one({"_id": ObjectId(report_id)})
        
        if not doc:
            raise HTTPException(status_code=404, detail="Report not found")
            
        # Format the document for JSON response
        doc["_id"] = str(doc["_id"])
        if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
            
        return doc

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Backend Error in /shared-report: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching shared report")
