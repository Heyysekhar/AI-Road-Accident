from fastapi import APIRouter
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
import os

router = APIRouter()

class AlertRequest(BaseModel):
    accident_location: str
    latitude: float
    longitude: float
    risk_level: str
    description: str
    contact_number: str = ""

class AlertResponse(BaseModel):
    sms_sent: bool
    email_sent: bool
    message: str

@router.post("/send", response_model=AlertResponse)
async def send_alert(alert: AlertRequest):
    sms_sent = False
    email_sent = False
    
    # SMS via Twilio
    try:
        from twilio.rest import Client
        sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        token = os.getenv("TWILIO_AUTH_TOKEN", "")
        if sid and token:
            client = Client(sid, token)
            msg = (f"🚨 ACCIDENT ALERT!\n"
                   f"Location: {alert.accident_location}\n"
                   f"Risk: {alert.risk_level}\n"
                   f"Lat/Lng: {alert.latitude},{alert.longitude}\n"
                   f"Details: {alert.description}")
            client.messages.create(
                body=msg,
                from_=os.getenv("TWILIO_PHONE"),
                to=os.getenv("EMERGENCY_PHONE")
            )
            sms_sent = True
    except Exception as e:
        print(f"SMS error: {e}")

    # Email Alert
    try:
        sender = os.getenv("ALERT_EMAIL", "")
        password = os.getenv("EMAIL_PASSWORD", "")
        if sender and password:
            msg = MIMEText(
                f"ACCIDENT ALERT!\n\n"
                f"Location: {alert.accident_location}\n"
                f"Coordinates: {alert.latitude}, {alert.longitude}\n"
                f"Risk Level: {alert.risk_level}\n"
                f"Description: {alert.description}\n\n"
                f"Google Maps: https://maps.google.com/?q={alert.latitude},{alert.longitude}"
            )
            msg['Subject'] = f"🚨 [{alert.risk_level}] Road Accident Alert"
            msg['From'] = sender
            msg['To'] = sender
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender, password)
                server.send_message(msg)
            email_sent = True
    except Exception as e:
        print(f"Email error: {e}")

    return AlertResponse(
        sms_sent=sms_sent,
        email_sent=email_sent,
        message="Alert processed. Configure .env for real notifications."
    )

@router.get("/nearby-hospitals")
async def nearby_hospitals(lat: float, lng: float):
    return {
        "hospitals": [
            {"name": "City General Hospital", "distance": "2.3 km",
             "phone": "+91-XXXXXXXXXX", "lat": lat + 0.02, "lng": lng + 0.01},
            {"name": "Emergency Care Center", "distance": "4.1 km",
             "phone": "+91-XXXXXXXXXX", "lat": lat - 0.03, "lng": lng + 0.02},
        ],
        "nearest": "City General Hospital"
    }
