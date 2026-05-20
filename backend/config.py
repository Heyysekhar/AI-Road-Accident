from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "accident_db"
    SECRET_KEY: str = "your-secret-key-here"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE: str = ""
    EMERGENCY_PHONE: str = ""
    ALERT_EMAIL: str = ""
    EMAIL_PASSWORD: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
