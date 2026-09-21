import os
import json
import hashlib
import uvicorn
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import errors
import pdfplumber
from dotenv import load_dotenv
from groq import Groq

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from database import (
    client,
    db,
    db_type,
    users_col,
    configs_col,
    interviews_col,
    evaluations_col
)

app = FastAPI(title="AI Interview System Backend")

# Enable CORS for Frontend Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class InterviewConfigRequest(BaseModel):
    user_email: str
    user_name: str
    target_role: str
    interview_type: str
    interview_level: str
    resume_filename: Optional[str] = "Uploaded_Resume.pdf"
    resume_skills: Optional[str] = ""

def check_db_ready():
    import database
    if database.users_col is None or database.client is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. Please check your MongoDB connection string in backend/.env."
        )

@app.get("/")
def home():
    import database
    try:
        if database.client:
            database.client.admin.command("ping")
            return {
                "status": "online",
                "message": f"AI Interview System Backend is running and connected to Database ({database.db_type.upper()})! 🚀",
                "database_type": database.db_type,
                "database_name": getattr(database.db, 'name', 'mockmate_db')
            }
        else:
            return {
                "status": "disconnected",
                "message": "Backend is running, but MongoDB is not connected yet.",
                "tip": "Please update your MongoDB Atlas URI in backend/.env file."
            }
    except Exception as e:
        return {
            "status": "degraded",
            "message": "Backend is running, but database ping failed.",
            "error": str(e)
        }

# User Registration Endpoint
@app.post("/api/register")
def register_user(req: RegisterRequest):
    import database
    check_db_ready()
    clean_email = req.email.strip().lower()
    clean_name = req.name.strip()
    pass_hash = hash_password(req.password.strip())

    existing_user = database.users_col.find_one({"email": clean_email})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This email is already registered. Please navigate to the Sign In tab to log in."
        )

    user_doc = {
        "name": clean_name,
        "email": clean_email,
        "password_hash": pass_hash,
        "created_at": datetime.utcnow()
    }

    try:
        result = database.users_col.insert_one(user_doc)
        return {
            "success": True,
            "message": "User registered successfully in MongoDB!",
            "token": f"token_{str(result.inserted_id)}",
            "user": {
                "id": str(result.inserted_id),
                "name": clean_name,
                "email": clean_email
            }
        }
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, 
            detail="This email is already registered. Please navigate to the Sign In tab to log in."
        )

# User Login Endpoint
@app.post("/api/login")
def login_user(req: LoginRequest):
    import database
    check_db_ready()
    clean_email = req.email.strip().lower()
    pass_hash = hash_password(req.password.strip())

    user = database.users_col.find_one({"email": clean_email})

    if not user:
        raise HTTPException(
            status_code=404, 
            detail="No account found with this email. Please create an account in the Sign Up tab."
        )

    if user.get("password_hash") != pass_hash:
        raise HTTPException(
            status_code=401, 
            detail="Incorrect password. Please verify your credentials and try again."
        )

    user_id = str(user["_id"])
    return {
        "success": True,
        "message": "Login successful!",
        "token": f"token_{user_id}",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"]
        }
    }

# Save Candidate Interview Configuration Endpoint
@app.post("/api/save-interview-config")
def save_interview_config(req: InterviewConfigRequest):
    import database
    check_db_ready()
    clean_email = req.user_email.strip().lower()
    
    config_doc = {
        "user_email": clean_email,
        "user_name": req.user_name,
        "target_role": req.target_role,
        "interview_type": req.interview_type,
        "interview_level": req.interview_level,
        "resume_filename": req.resume_filename,
        "resume_skills": req.resume_skills,
        "created_at": datetime.utcnow()
    }

    result = database.configs_col.insert_one(config_doc)

    return {
        "success": True,
        "message": "Interview configuration saved to MongoDB successfully!",
        "config_id": str(result.inserted_id),
        "config": req.dict()
    }

# Fetch Latest Interview Configuration
@app.get("/api/get-latest-config/{user_email}")
def get_latest_config(user_email: str):
    import database
    check_db_ready()
    clean_email = user_email.strip().lower()
    
    doc = database.configs_col.find_one({"user_email": clean_email}, sort=[("created_at", -1)])

    if not doc:
        return {"has_config": False}

    return {
        "has_config": True,
        "config": {
            "user_name": doc.get("user_name"),
            "target_role": doc.get("target_role"),
            "interview_type": doc.get("interview_type"),
            "interview_level": doc.get("interview_level"),
            "resume_filename": doc.get("resume_filename"),
            "resume_skills": doc.get("resume_skills"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None
        }
    }

class TranscriptMessage(BaseModel):
    role: str
    text: str
    ts: str

class SaveTranscriptRequest(BaseModel):
    user_email: str
    user_name: str
    target_role: str
    interview_level: str
    messages: list[TranscriptMessage]

# Save Interview Transcript
@app.post("/api/save-transcript")
def save_transcript(req: SaveTranscriptRequest):
    import database
    check_db_ready()
    
    transcript_doc = {
        "user_email": req.user_email.strip().lower(),
        "user_name": req.user_name,
        "target_role": req.target_role,
        "interview_level": req.interview_level,
        "messages": [msg.dict() for msg in req.messages],
        "created_at": datetime.utcnow()
    }
    
    result = database.interviews_col.insert_one(transcript_doc)
    
    return {
        "success": True,
        "message": "Interview transcript saved successfully!",
        "transcript_id": str(result.inserted_id)
    }

# Evaluate Interview Transcript Endpoint
@app.post("/api/evaluate-transcript/{transcript_id}")
def evaluate_transcript_endpoint(transcript_id: str):
    import database
    check_db_ready()
    try:
        from bson import ObjectId
        obj_id = ObjectId(transcript_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transcript ID")
        
    transcript = database.interviews_col.find_one({"_id": obj_id})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
        
    # Evaluate
    from evaluation_service import evaluate_transcript
    evaluation_result = evaluate_transcript(transcript_id, transcript)
    
    # Save to evaluations collection
    eval_doc = {
        "transcript_id": transcript_id,
        "user_email": transcript.get("user_email"),
        "metrics": evaluation_result,
        "created_at": datetime.utcnow()
    }
    database.evaluations_col.insert_one(eval_doc)
    
    return {
        "success": True,
        "message": "Evaluation completed!",
        "metrics": evaluation_result
    }

# Get Evaluation Results Endpoint
@app.get("/api/evaluations/{transcript_id}")
def get_evaluation(transcript_id: str):
    import database
    check_db_ready()
    eval_doc = database.evaluations_col.find_one({"transcript_id": transcript_id})
    if not eval_doc:
        raise HTTPException(status_code=404, detail="Evaluation not found for this transcript")
    
    # Remove _id for JSON serialization
    eval_doc.pop("_id", None)
    return {
        "success": True,
        "evaluation": eval_doc
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)