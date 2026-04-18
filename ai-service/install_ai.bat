@echo off
echo --- Setting up AI Service Environment ---

:: Check if python exists
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python.
    exit /b 1
)

:: Create venv if not exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate and Install
echo Installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Some packages failed to install. attempting basic install...
    pip install fastapi uvicorn requests
)

echo.
echo --- Setup Complete ---
echo To run:
echo cd ai-service
echo venv\Scripts\activate
echo uvicorn main:app --reload
pause
