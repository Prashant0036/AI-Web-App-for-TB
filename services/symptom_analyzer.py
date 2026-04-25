import os
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

async def analyze_symptoms(patient_data: dict) -> dict:
    """
    Analyze patient symptoms using Gemini 2.0 Flash and provide risk score, tests, tips, and diet.
    """
    if not api_key:
        return {"error": "API key not found", "score": 0}

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a Tuberculosis (TB) risk assessment consultant AI and Nutritionist.
        Analyze the patient data below and respond with ONLY a raw JSON object — no markdown fences, no explanation, no extra text.

        Required JSON format:
        {{
            "score": <integer 0-100 representing TB risk percentage>,
            "test": "<recommended diagnostic tests or 'No test needed'>",
            "tips": "<personalized health and lifestyle tips, mention patient name if possible>",
            "diet": "<localized, high-protein diet plan tailored to their region/state based on their risk score and symptoms. Be specific with local food names>"
        }}

        Patient data:
        {json.dumps(patient_data, indent=2)}
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        text = response.text
        print("Gemini Symptom Analysis Raw Response:", text)
        
        # Extract JSON
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                # Ensure score is an integer
                if "score" in parsed and isinstance(parsed["score"], str):
                    digits = re.findall(r'\d+', parsed["score"])
                    parsed["score"] = int(digits[0]) if digits else 0
                return parsed
            except Exception as json_e:
                print("JSON parsing error:", json_e)
                
        return {
            "score": 50, 
            "test": "Could not generate tests. Please consult a doctor.", 
            "tips": "Could not generate tips. Please consult a doctor.",
            "diet": "Could not generate diet. Please ensure a high-protein intake."
        }

    except Exception as e:
        print(f"Gemini Symptom Analysis Error: {e}")
        return {
            "score": 0,
            "test": "Error communicating with AI.",
            "tips": "Error communicating with AI.",
            "diet": "Error communicating with AI.",
            "error": str(e)
        }
