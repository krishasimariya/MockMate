import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient, errors
from pymongo.server_api import ServerApi

# Fix Windows console encoding for UTF-8 logs
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mockmate_db")

client = None
db = None
users_col = None
configs_col = None
interviews_col = None
evaluations_col = None
db_type = "none"

def init_mongodb():
    global client, db, users_col, configs_col, interviews_col, evaluations_col, db_type
    
    # Check if placeholder is still present
    if "<db_password>" in MONGO_URI:
        print("⚠️ [MongoDB Warning]: '<db_password>' placeholder found in MONGO_URI. Please provide your actual MongoDB password in the .env file.")
    
    try:
        # Create MongoDB Client
        client = MongoClient(
            MONGO_URI,
            server_api=ServerApi("1") if "mongodb+srv" in MONGO_URI else None,
            serverSelectionTimeoutMS=5000
        )
        
        # Verify connection by pinging MongoDB
        client.admin.command("ping")
        db = client[DB_NAME]
        
        # Initialize Collections
        users_col = db["users"]
        configs_col = db["interview_configs"]
        interviews_col = db["interviews"]
        evaluations_col = db["evaluations"]
        
        # Create Indexes
        users_col.create_index("email", unique=True)
        configs_col.create_index("user_email")
        
        db_type = "mongodb"
        print(f"✅ MongoDB connected successfully to database: '{DB_NAME}' 🚀")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        db_type = "error"
        return False

# Initialize on module load
init_mongodb()