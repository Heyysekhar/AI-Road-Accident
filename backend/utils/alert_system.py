"""Alert system utilities"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_sms_alert(message: str, to_number: str = None):
    """Send SMS using Twilio"""
    try:
        from twilio.rest import Client
        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_PHONE")
        to_phone = to_number or os.getenv("EMERGENCY_PHONE")
        if all([sid, token, from_phone, to_phone]):
            client = Client(sid, token)
            client.messages.create(body=message, from_=from_phone, to=to_phone)
            return True
    except Exception as e:
        print(f"SMS failed: {e}")
    return False

def send_email_alert(subject: str, body: str):
    """Send email alert via Gmail SMTP"""
    try:
        sender = os.getenv("ALERT_EMAIL")
        password = os.getenv("EMAIL_PASSWORD")
        receiver = os.getenv("ALERT_EMAIL")
        if not all([sender, password]):
            return False
        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = receiver
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
            s.login(sender, password)
            s.send_message(msg)
        return True
    except Exception as e:
        print(f"Email failed: {e}")
    return False
