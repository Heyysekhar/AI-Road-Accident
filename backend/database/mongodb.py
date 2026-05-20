from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "accident_db")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

accidents_collection = db["accidents"]
alerts_collection = db["alerts"]
predictions_collection = db["predictions"]
users_collection = db["users"]

async def get_database():
    return db
