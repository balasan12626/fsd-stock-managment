@echo off
echo --- Starting a6b Stock AI Service ---
cd /d "%~dp0"
if not exist "venv" (
    echo [ERROR] Virtual environment not found. Please run install_ai.bat first.
    pause
    exit /b 1
)
echo AI Service is starting on http://127.0.0.1:8000
echo Control+C to terminate the uplink.
"venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
