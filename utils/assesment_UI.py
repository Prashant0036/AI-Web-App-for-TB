# utils/assesment_UI.py
import streamlit as st

def show_result_ui(response: dict):
    st.subheader("AI Assessment")
    st.json(response)
    st.markdown("---")
    st.write("LLM Response (friendly):")
    st.write(response.get("llm_response"))
