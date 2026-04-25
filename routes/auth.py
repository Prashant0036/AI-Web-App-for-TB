from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from config.db import users_collection
from utils.auth_utils import get_password_hash, verify_password, create_access_token
import datetime

router = APIRouter()

# Pydantic models for user registration and login
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserRegister):
    # Check if the email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    

    # Hash the password and save the user
    user_dict = {
        "username": user.username,
        "email": user.email,
        "password": get_password_hash(user.password),
        "created_at": datetime.datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_dict)
    
    # Automatically log the user in by generating an access token
    access_token = create_access_token(data={"sub": user.email, "username": user.username})
    
    return {
        "message": "User registered successfully", 
        "user_id": str(result.inserted_id),
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@router.post("/login")
async def login(user: UserLogin):
    # Find user by email
    db_user = users_collection.find_one({"email": user.email})
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    # Create the JWT token
    access_token = create_access_token(data={"sub": db_user["email"], "username": db_user["username"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user["username"]
    }
