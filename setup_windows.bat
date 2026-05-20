@echo off
echo ========================================
echo  AI Accident Prediction System - Setup
echo ========================================
echo.

echo [1/4] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo [3/4] Training ML Model...
cd backend\ml
python train_model.py
cd ..\..

echo [4/4] Installing Frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To START the project:
echo   Terminal 1: cd backend ^& uvicorn main:app --reload
echo   Terminal 2: cd frontend ^& npm start
echo.
pause
