import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Fix Windows console encoding
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME = os.getenv("DB_NAME", "mockmate_db")

print("=" * 60)
print("🔍 TESTING MONGODB CONNECTION...")
print("=" * 60)
print(f"📌 DB Name: {DB_NAME}")

if not MONGO_URI:
    print("❌ ERROR: MONGO_URI not found in backend/.env file!")
    sys.exit(1)

if "<db_password>" in MONGO_URI:
    print("⚠️ WARNING: MONGO_URI still contains the '<db_password>' placeholder!")
    print("👉 Please open backend/.env and replace '<db_password>' with your actual MongoDB password.")
    print("=" * 60)
    sys.exit(1)

try:
    print("⏳ Connecting to MongoDB...")
    client = MongoClient(
        MONGO_URI,
        server_api=ServerApi("1") if "mongodb+srv" in MONGO_URI else None,
        serverSelectionTimeoutMS=5000
    )
    
    # Ping test
    res = client.admin.command("ping")
    print(f"✅ Ping Response: {res}")
    
    db = client[DB_NAME]
    collections = db.list_collection_names()
    print(f"🎉 SUCCESS: Connected to MongoDB successfully!")
    print(f"📁 Collections in '{DB_NAME}': {collections}")
    print("=" * 60)

except Exception as e:
    print(f"❌ CONNECTION FAILED: {e}")
    print("\n💡 Troubleshooting Checklist:")
    print("1. Verify your database password in backend/.env.")
    print("2. Ensure IP Access List in MongoDB Atlas has '0.0.0.0/0 (Allow access from anywhere)' enabled.")
    print("=" * 60)
