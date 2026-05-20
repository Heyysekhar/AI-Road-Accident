# 🚗 AI-Powered Smart Road Accident Prediction & Emergency Response System

> B.Tech Major Project | Hackathon Level | Industry Grade

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React](https://img.shields.io/badge/React-18-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-latest-red)

---

## 📁 Project Structure

```
AI-Accident-System/
├── backend/              ← FastAPI REST API
│   ├── main.py           ← App entry point
│   ├── config.py         ← Environment config
│   ├── routes/           ← API endpoints
│   │   ├── prediction.py ← ML prediction API
│   │   ├── alerts.py     ← SMS/Email alerts
│   │   ├── dashboard.py  ← Stats & charts data
│   │   └── detection.py  ← YOLO detection API
│   ├── ml/               ← ML model files
│   │   └── train_model.py← Model training script
│   ├── utils/            ← Helper utilities
│   └── database/         ← MongoDB connection
├── frontend/             ← React.js Dashboard
│   ├── src/
│   │   ├── App.jsx       ← Main app + routing
│   │   └── pages/        ← Dashboard, Predict, Alerts, Map
│   └── package.json
├── YOLO/                 ← Computer Vision modules
│   ├── accident_detection.py   ← YOLOv8 accident detect
│   └── drowsiness_detection.py ← Driver drowsiness
├── notebooks/            ← EDA & training scripts
├── dataset/              ← Dataset info & links
├── .env.example          ← Environment variables template
└── requirements.txt      ← All Python dependencies
```

---

## ⚡ Step-by-Step Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- Git

---

### STEP 1 — Clone & Setup Environment

```bash
# Clone the project
git clone https://github.com/YOUR_USERNAME/AI-Accident-System.git
cd AI-Accident-System

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials (MongoDB, Twilio, Gmail, etc.)
```

---

### STEP 2 — Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

---

### STEP 3 — Train the ML Model

```bash
# From backend/ml/ folder
cd ml
python train_model.py

# You will see:
# Training Random Forest...
# Training Gradient Boosting...
# Best Model: RandomForest (0.94xx)
# Model saved: accident_model.pkl
```

---

### STEP 4 — Start Backend API

```bash
# From backend/ folder
cd ..  # back to backend/
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Backend running at: http://localhost:8000
# API Docs at: http://localhost:8000/docs
```

---

### STEP 5 — Frontend Setup

```bash
# Open new terminal
cd frontend

# Install Node packages
npm install

# Start React app
npm start

# Frontend running at: http://localhost:3000
```

---

### STEP 6 — Run YOLO Detection (Optional)

```bash
# Install YOLO dependencies
pip install ultralytics opencv-python mediapipe

# Accident detection (webcam)
cd YOLO
python accident_detection.py --source 0

# Drowsiness detection
python drowsiness_detection.py
```

---

### STEP 7 — Run EDA & Plots (Optional)

```bash
cd notebooks
python accident_eda.py
# Plot saved to screenshots/eda_plots.png
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/predict/accident | Predict accident risk |
| POST | /api/alerts/send | Send emergency alert |
| GET | /api/alerts/nearby-hospitals | Get nearby hospitals |
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/dashboard/heatmap | Risk heatmap data |
| GET | /api/dashboard/recent-alerts | Recent alerts list |
| GET | /api/dashboard/weekly-trend | Weekly trend data |

---

## ⚙️ Configure Alerts (.env)

```env
# Twilio (for SMS) — free account at twilio.com
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE=+1XXXXXXXXXX
EMERGENCY_PHONE=+91XXXXXXXXXX

# Gmail (use App Password from Google Account)
ALERT_EMAIL=your@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🚀 Deployment

```bash
# Backend — Render.com / Railway
# Push to GitHub, connect repo, set env vars

# Frontend — Vercel
npm run build
# Deploy build/ folder on Vercel
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Chart.js, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | MongoDB |
| ML | Scikit-learn, XGBoost, LightGBM |
| CV/DL | YOLOv8, OpenCV, MediaPipe |
| Alerts | Twilio, Gmail SMTP |
| Deployment | Vercel + Render |

---

## 👨‍💻 Author

Made with ❤️ for B.Tech Major Project
