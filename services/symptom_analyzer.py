import json
import re
from services.gemini_client import generate_with_fallback

async def analyze_symptoms(patient_data: dict) -> dict:
    """
    Analyze patient symptoms using Gemini (with fallback) and provide risk score, tests, tips, and diet.
    """
    try:
        
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

        text = await generate_with_fallback(contents=prompt)
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
