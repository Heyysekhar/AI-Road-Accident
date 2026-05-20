from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/stats")
async def get_stats():
    return {
        "total_predictions_today": random.randint(150, 300),
        "high_risk_alerts": random.randint(10, 30),
        "accidents_prevented": random.randint(5, 15),
        "active_monitors": random.randint(20, 50),
        "accuracy": "94.2%",
        "last_updated": datetime.now().isoformat()
    }

@router.get("/heatmap")
async def get_heatmap():
    # Sample heatmap data (lat, lng, intensity)
    zones = [
        {"lat": 28.6139, "lng": 77.2090, "intensity": 0.9, "label": "High Risk Zone - Delhi"},
        {"lat": 19.0760, "lng": 72.8777, "intensity": 0.7, "label": "Medium Risk - Mumbai"},
        {"lat": 13.0827, "lng": 80.2707, "intensity": 0.5, "label": "Medium Risk - Chennai"},
        {"lat": 22.5726, "lng": 88.3639, "intensity": 0.8, "label": "High Risk - Kolkata"},
        {"lat": 17.3850, "lng": 78.4867, "intensity": 0.6, "label": "Medium Risk - Hyderabad"},
    ]
    return {"zones": zones}

@router.get("/recent-alerts")
async def recent_alerts():
    alerts = []
    for i in range(10):
        t = datetime.now() - timedelta(minutes=random.randint(1, 120))
        alerts.append({
            "id": i+1,
            "time": t.strftime("%Y-%m-%d %H:%M"),
            "location": random.choice(["NH-8 Delhi", "Ring Road Bangalore", "Marine Drive Mumbai"]),
            "risk": random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            "type": random.choice(["Speed Violation", "Bad Weather", "Heavy Traffic", "Drowsy Driver"])
        })
    return {"alerts": alerts}

@router.get("/weekly-trend")
async def weekly_trend():
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return {
        "labels": days,
        "accidents": [random.randint(10, 50) for _ in days],
        "predictions": [random.randint(60, 100) for _ in days],
        "prevented": [random.randint(5, 20) for _ in days]
    }
