from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import prediction, alerts, dashboard, detection, gps, voice
import uvicorn

app = FastAPI(
    title="AI Road Accident Prediction System",
    description="AI-Powered Smart Road Accident Prediction & Emergency Response System",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router, prefix="/api/predict",   tags=["Prediction"])
app.include_router(alerts.router,     prefix="/api/alerts",    tags=["Alerts"])
app.include_router(dashboard.router,  prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(detection.router,  prefix="/api/detection", tags=["Detection"])
app.include_router(gps.router,        prefix="/api/gps",       tags=["GPS Tracking"])
app.include_router(voice.router,      prefix="/api/voice",     tags=["Voice Assistant"])

@app.get("/")
def root():
    return {
        "message": "AI Road Accident Prediction API v2.0 🚀",
        "features": ["ML Prediction","Emergency Alerts","GPS Tracking","Voice Assistant","Live Map","Hospital Finder"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
