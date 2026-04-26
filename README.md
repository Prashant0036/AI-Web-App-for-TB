# 🩺 TBRisk AI: Advanced Tuberculosis Risk Assessment

TBRisk AI is a state-of-the-art, multimodal web application designed to assist in the early detection and risk assessment of Tuberculosis (TB). By combining the power of Large Language Models (LLMs) with specialized Computer Vision, it provides a comprehensive screening tool for both patients and healthcare providers.

---

## 🚀 Key Features

*   **🧠 Intelligent Symptom Checker**: Analyzes patient symptoms, risk factors (HIV, Diabetes, etc.), and demographics using Google Gemini to provide a personalized risk score and health tips.
*   **📂 AI Report Intelligence**: 
    *   **PDF Analysis**: Extracts and interprets data from laboratory blood reports and diagnostic summaries.
    *   **X-Ray Analysis**: Uses a custom **VGG16 Deep Learning model** (TFLite) to classify chest X-rays for TB signs, cross-referenced with Gemini Multimodal analysis.
*   **📜 Clinical History**: Securely tracks all past assessments and reports for longitudinal health monitoring.
*   **🔗 Secure Link Sharing**: Generate shareable, public links for reports to easily consult with doctors or specialists.
*   **🌓 Modern UI/UX**: Premium dark/light mode interface built with React and polished with fluid micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons, Vanilla CSS / Tailwind |
| **Backend** | FastAPI (Python 3.12), Uvicorn |
| **Database** | MongoDB (Atlas) |
| **AI (LLM)** | Google Gemini 2.0 Flash / 3.0 Flash (with auto-fallback) |
| **AI (Vision)** | TensorFlow Lite (VGG16 Architecture) |
| **Auth** | JWT (JSON Web Tokens) with Bcrypt hashing |

---

## 📁 Project Structure

```text
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── components/     # UI Components (SharedReport, History, etc.)
│   │   └── App.jsx         # Main Routing and Logic
├── routes/                 # FastAPI Route Handlers
│   ├── auth.py             # User Signup/Login logic
│   └── process.py          # Symptom and Report processing
├── services/               # Core Business Logic & AI Clients
│   ├── gemini_client.py    # Centralized Gemini fallback system
│   ├── report_analyzer.py  # PDF/Image Multimodal analysis
│   ├── symptom_analyzer.py # Symptom-to-JSON engine
│   └── tb_classifier.py    # TFLite Image Classification
├── config/                 # Database and App configuration
└── Tuberculosis_Detection/ # Trained TFLite models and assets
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB instance (Local or Atlas)
- Google AI Studio API Key (Gemini)

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure Environment
# Create a .env file with:
# MONGO_URI=your_mongodb_uri
# SECRET_KEY=your_jwt_secret
# GEMINI_API_KEY=your_api_key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Running the App
**Start Backend:**
```bash
fastapi dev backend.py
```
**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🛡️ Disclaimer
*This application is an AI-powered screening tool and is **not** a substitute for professional medical diagnosis. All results should be verified by a certified healthcare professional.*

---
**Developed for Advanced TB Screening Research.**
