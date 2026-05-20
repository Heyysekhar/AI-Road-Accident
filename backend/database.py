from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.accident_db
    print("✅ MongoDB connected successfully")


async def close_db():
    global client
    if client:
        client.close()
        print("🔴 MongoDB connection closed")


def get_db():
    return db
