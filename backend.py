# pip install "fastapi[standard]"
# fastapi dev backend.py


from fastapi import FastAPI, Request
from routes import process   # import your routes

app = FastAPI()

# include the routers
app.include_router(process.router) 
# /process end points wali requests ko handle krega ye route

@app.get("/")
def root():
    return {"message": "Main backend running!"}


