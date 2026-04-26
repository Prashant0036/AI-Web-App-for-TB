from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes import process, auth

app = FastAPI(title="TBRisk AI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://tbrisk-ai.netlify.app",
        "https://tbrisk-ai.run.place",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(process.router)
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "message": "TBRisk AI Backend is running!",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=10000, reload=True)


