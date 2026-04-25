from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from config.db import mycollection
from services.symptom_analyzer import analyze_symptoms
from services.report_analyzer import analyze_medical_report
from services.tb_classifier import predict_tb
import copy
import json

router = APIRouter()

@router.post("/process")
async def process_data(request: Request):
    """
    Endpoint for TB Symptom Checker.
    Analyzes patient data and returns a risk score + recommendations.
    """
    try:
        data = await request.json()
        print("Processing assessment for:", data.get('name', 'Unknown'))
        
        # Insert raw data into DB for records
        data_copy = copy.deepcopy(data)
        mycollection.insert_one(data_copy)

        # Analyze symptoms using Gemini service
        analysis_result = await analyze_symptoms(data)
        
        return {
            "message": "Assessment complete",
            "risk_score": analysis_result.get("score", 0),
            "llm_response": analysis_result
        }

    except Exception as e:
        print("Backend Error in /process:", e)
        return {"error": str(e), "risk_score": 0}

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    """
    Endpoint for Medical Report Analysis.
    Handles PDF lab results and Image-based X-rays.
    """
    try:
        file_bytes = await file.read()
        mime_type = file.content_type
        
        print(f"Analyzing report: {file.filename} ({mime_type})")

        # 1. Base Analysis using Gemini (Multimodal)
        # prompt_type determines if it's treated as an X-ray or General Lab Report
        prompt_type = "x-ray" if "image" in mime_type else "general"
        analysis = await analyze_medical_report(file_bytes, mime_type, prompt_type)

        # 2. If it's an image (X-ray), also run local TFLite Classifier for verification
        if "image" in mime_type:
            custom_model_result = await predict_tb(file_bytes)
            analysis["custom_model"] = custom_model_result
            
            # Optionally adjust risk score based on custom model
            if "error" not in custom_model_result:
                # If custom model is very confident about TB, ensure risk score reflects it
                if custom_model_result["label"] == "Tuberculosis" and custom_model_result["confidence"] > 0.8:
                    analysis["risk_score"] = max(analysis.get("risk_score", 0), 85)

        return analysis

    except Exception as e:
        print("Backend Error in /analyze-report:", e)
        raise HTTPException(status_code=500, detail=str(e))
