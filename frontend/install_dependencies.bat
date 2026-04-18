@echo off
echo Installing missing npm packages...
cd /d d:\fsd_project\frontend
call npm install
if %errorlevel% neq 0 (
    echo Installation failed!
    pause
    exit /b 1
)
echo.
echo Installation complete! You can now run: npm run dev
pause
