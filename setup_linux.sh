#!/bin/bash
echo "========================================"
echo " AI Accident Prediction System - Setup"
echo "========================================"

echo "[1/4] Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "[2/4] Installing Python dependencies..."
pip install -r requirements.txt

echo "[3/4] Training ML Model..."
cd backend/ml && python train_model.py && cd ../..

echo "[4/4] Installing Frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo "To START the system:"
echo "  Terminal 1: source venv/bin/activate && cd backend && uvicorn main:app --reload"
echo "  Terminal 2: cd frontend && npm start"
