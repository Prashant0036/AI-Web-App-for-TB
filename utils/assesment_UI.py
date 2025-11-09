import streamlit as st

def show_result_ui(response_data: dict):
    """Display TB risk results in a clean modular UI with color-coded score."""
    st.markdown("### 🩺 Assessment Results")

    llm_data = response_data.get("llm_response", {})

    score = llm_data.get("score", 0)
    tests = llm_data.get("test", "No recommendation available.")
    tips = llm_data.get("tips", "No tips provided.")

    # ---- Choose gradient color based on score ----
    if score <= 33:
        gradient = "linear-gradient(90deg, #38A169, #9AE6B4)"  # Green
        emoji = "🟢"
    elif score <= 66:
        gradient = "linear-gradient(90deg, #ECC94B, #FAF089)"  # Yellow
        emoji = "🟡"
    else:
        gradient = "linear-gradient(90deg, #E53E3E, #FEB2B2)"  # Red
        emoji = "🔴"

    # ---- Score Card ----
    st.markdown(
        f"""
        <div style="
            background: {gradient};
            color: white;
            padding: 20px;
            border-radius: 14px;
            text-align: center;
            font-size: 30px;
            font-weight: 800;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
            margin-top: 10px;
            transition: all 0.4s ease;">
            {emoji} TB Risk Score: {score}%
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ---- Recommendations ----
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 🧪 Recommended Tests")
        st.info(tests)

    with col2:
        st.markdown("### 💡 Health Tips")
        st.success(tips)

    # ---- Footer ----
    st.markdown(
        "<hr><small>⚠️ This is an AI-generated assessment. Always consult a qualified doctor before making medical decisions.</small>",
        unsafe_allow_html=True,
    )
