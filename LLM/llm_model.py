# https://ai.google.dev/gemini-api/docs/api-key

# pip install google-generativeai


# pip install google-generativeai python-dotenv


from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# api_key = os.getenv("GEMINI_API_KEY")
# print(api_key)


import os
from google import genai
from google.genai import types
import streamlit as st


async def generate(prompt):
    client = genai.Client(
        api_key=st.secrets["GEMINI_API_KEY"],
    )

    model = "gemini-flash-latest"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    tools = [
        types.Tool(googleSearch=types.GoogleSearch(
        )),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        ),
        tools=tools,
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        # print(chunk.text, end="")
        return chunk.text




# if __name__ == "__main__":
    # generate()

