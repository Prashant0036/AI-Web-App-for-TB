import io
import pdfplumber
import re
import json
from google.genai import types
from typing import Optional
from services.gemini_client import generate_with_fallback


async def analyze_medical_report(file_bytes: bytes, mime_type: str, prompt_type: str = "general") -> dict:
    """
    Analyze a medical report (image or PDF) using Gemini with model fallback.
    """
    try:
        
        extracted_text = ""
        # Handle PDF specifically with pdfplumber
        if mime_type == "application/pdf":
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += page_text + "\n"
            except Exception as e:
                print(f"pdfplumber extraction error: {e}")
        
        print("pdfplumber extracted text length:", len(extracted_text))

        # Base prompt based on feature type
        if "x-ray" in prompt_type.lower():
            prompt = """
            You are a Radiologist specializing in Tuberculosis. Analyze this Chest X-ray.
            Identify any signs of TB (opacities, cavities, hilar lymphadenopathy, pleural effusion).
            Provide a summary of findings and a calculated risk score.
            Do NOT provide a definitive diagnosis, use cautious medical language.
            Respond strictly in JSON format exactly like this:
            {"summary": "detailed summary here", "risk_score": 45, "risk_level": "Moderate", "findings": ["item 1", "item 2"], "recommendation": "recommendation here"}
            """
        else:
            prompt = """
            You are a Medical Diagnostic Consultant. Analyze this medical report, blood report, or lab result.
            Extract key parameters related to Tuberculosis (e.g., ESR, Hb, WBC counts, or specific TB tests like IGRA/Mantoux).
            Summarize the results in a detailed paragraph, flag any abnormal values, provide a medical recommendation, and a calculated risk score for Tuberculosis.
            Respond strictly in JSON format exactly like this:
            {"summary": "detailed summary here", "risk_score": 75, "abnormal_flags": ["flag 1", "flag 2"], "recommendation": "recommendation here"}
            """

        # Prepare content for Gemini
        if extracted_text.strip():
            content = f"{prompt}\n\nHere is the extracted text from the medical report:\n\n{extracted_text}"
        else:
            # For images or unparseable PDFs, send as a Part
            content = [
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                types.Part.from_text(text=prompt)
            ]
        
        text = await generate_with_fallback(contents=content)
        print("Gemini raw response:", text)
        
        # Extract JSON
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                # Ensure risk_score is an integer
                if "risk_score" in parsed and isinstance(parsed["risk_score"], str):
                    digits = re.findall(r'\d+', parsed["risk_score"])
                    parsed["risk_score"] = int(digits[0]) if digits else 0
                return parsed
            except Exception as json_e:
                print("JSON parsing error:", json_e)
        
        return {"summary": text, "raw": True, "risk_score": 0, "recommendation": "Could not parse AI response perfectly."}

    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {"error": str(e), "risk_score": 0}
