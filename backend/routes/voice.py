from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

COMMANDS = {
    "sos":               {"action":"SOS_ACTIVATED",    "severity":"CRITICAL", "response_text":"SOS activated! Broadcasting location to all emergency services. Help is on the way."},
    "emergency":         {"action":"EMERGENCY_ALERT",  "severity":"CRITICAL", "response_text":"Emergency services alerted. Stay calm. Do not leave the vehicle."},
    "ambulance":         {"action":"CALL_AMBULANCE",   "severity":"CRITICAL", "response_text":"Calling ambulance. Keep victim still, do not remove embedded objects."},
    "police":            {"action":"POLICE_NOTIFIED",  "severity":"HIGH",     "response_text":"Police notified with your GPS coordinates. Stay at the scene."},
    "accident":          {"action":"ACCIDENT_REPORTED","severity":"CRITICAL", "response_text":"Accident reported! Alerting emergency services and nearby hospitals."},
    "hospital":          {"action":"HOSPITAL_SEARCH",  "severity":"INFO",     "response_text":"Locating nearest hospitals and trauma centres in your area."},
    "safe route":        {"action":"ROUTE_CALC",       "severity":"INFO",     "response_text":"Calculating safest route, avoiding all high-risk accident zones."},
    "high risk":         {"action":"RISK_WARNING",     "severity":"HIGH",     "response_text":"High accident risk detected! Reduce speed immediately and stay alert."},
    "drowsy":            {"action":"DROWSINESS_ALERT", "severity":"HIGH",     "response_text":"Drowsiness detected! Pull over safely. Do not continue driving."},
    "weather":           {"action":"WEATHER_WARNING",  "severity":"MEDIUM",   "response_text":"Adverse weather ahead. Reduce speed and increase following distance."},
    "traffic":           {"action":"TRAFFIC_ALERT",    "severity":"MEDIUM",   "response_text":"Heavy traffic ahead. Alternate route recommended."},
    "hazard":            {"action":"ROAD_HAZARD",      "severity":"HIGH",     "response_text":"Road hazard detected! Reduce speed and proceed with caution."},
    "speed":             {"action":"SPEED_WARNING",    "severity":"HIGH",     "response_text":"Warning: speed-monitored zone ahead. Please reduce speed."},
}

class VoiceCmd(BaseModel):
    command: str
    lat: float = 0.0
    lng: float = 0.0

@router.post("/command")
async def process(cmd: VoiceCmd):
    text = cmd.command.lower()
    for key, resp in COMMANDS.items():
        if key in text:
            return {"recognized":True, "matched_command":key, **resp,
                    "lat":cmd.lat, "lng":cmd.lng}
    return {"recognized":False, "action":"UNKNOWN", "severity":"INFO",
            "response_text":f'"{cmd.command}" not recognized. Try: SOS, ambulance, nearest hospital.'}

@router.get("/commands-list")
async def list_cmds():
    return {"commands": list(COMMANDS.keys()),
            "categories":{"emergency":["sos","emergency","ambulance","police","accident"],
                          "navigation":["hospital","safe route"],
                          "alerts":["high risk","drowsy","weather","traffic","hazard","speed"]}}
