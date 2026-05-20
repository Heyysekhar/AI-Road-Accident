from fastapi import APIRouter
import joblib
import numpy as np
from pydantic import BaseModel
import os

router = APIRouter()

class AccidentInput(BaseModel):
    hour: int
    day_of_week: int
    weather: int          # 0=Clear, 1=Rain, 2=Fog, 3=Snow
    road_condition: int   # 0=Dry, 1=Wet, 2=Icy
    speed: float
    traffic_density: int  # 0=Low, 1=Medium, 2=High
    driver_age: int
    driver_experience: int
    visibility: float     # 0-100
    temperature: float

class PredictionOutput(BaseModel):
    accident_probability: float
    risk_level: str
    risk_score: int
    contributing_factors: list

def get_risk_level(prob):
    if prob < 0.3:
        return "LOW"
    elif prob < 0.6:
        return "MEDIUM"
    elif prob < 0.8:
        return "HIGH"
    else:
        return "CRITICAL"

@router.post("/accident", response_model=PredictionOutput)
async def predict_accident(data: AccidentInput):
    try:
        model_path = os.path.join(os.path.dirname(__file__), "../ml/accident_model.pkl")
        model = joblib.load(model_path)
        
        features = np.array([[
            data.hour, data.day_of_week, data.weather,
            data.road_condition, data.speed, data.traffic_density,
            data.driver_age, data.driver_experience,
            data.visibility, data.temperature
        ]])
        
        prob = float(model.predict_proba(features)[0][1])
    except:
        # Fallback rule-based scoring if model not loaded
        score = 0
        if data.weather in [1, 2, 3]: score += 0.2
        if data.road_condition in [1, 2]: score += 0.2
        if data.speed > 80: score += 0.2
        if data.traffic_density == 2: score += 0.15
        if data.visibility < 50: score += 0.15
        if data.driver_age < 25 or data.driver_age > 65: score += 0.1
        prob = min(score, 0.99)

    risk_level = get_risk_level(prob)
    
    factors = []
    if data.weather != 0: factors.append("Bad Weather Conditions")
    if data.road_condition != 0: factors.append("Poor Road Condition")
    if data.speed > 80: factors.append("Overspeeding")
    if data.visibility < 50: factors.append("Low Visibility")
    if data.traffic_density == 2: factors.append("Heavy Traffic")
    if data.driver_age < 25: factors.append("Young Driver (High Risk Age)")

    return PredictionOutput(
        accident_probability=round(prob, 4),
        risk_level=risk_level,
        risk_score=int(prob * 100),
        contributing_factors=factors if factors else ["Normal Conditions"]
    )
