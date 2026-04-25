import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

async def generate(prompt):
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    client = genai.Client(
        api_key=api_key,
    )

    model = "gemini-2.0-flash"  # Using 2.0 flash as it's more current than 1.5 flash-latest in most contexts now
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
            )
        )
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Error generating response: {e}"

