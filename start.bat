@echo off
REM Math Quiz Launcher v2 - with log redirection
title Math Quiz Launcher

echo.
echo ============================================
echo   Primary School Math Quiz (Grade 1-2)
echo ============================================
echo.

REM Step 1: check Python
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python not found in PATH.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo IMPORTANT: tick "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
)

echo [OK] Python detected.
python --version
echo.

REM Step 2: switch to backend dir
cd /d "%~dp0backend"
if not exist "app.py" (
    echo [ERROR] backend\app.py not found.
    pause
    exit /b 1
)

REM Step 3: install deps quietly
echo [INFO] Installing required Python packages...
python -m pip install --quiet --disable-pip-version-check -r requirements.txt
if errorlevel 1 (
    echo [WARN] pip had issues, retrying with --user...
    python -m pip install --quiet --disable-pip-version-check --user -r requirements.txt
)
echo [OK] Packages ready.
echo.

REM Step 4: start server (with detailed logging)
echo ============================================
echo   Server starting...
echo   URL: http://127.0.0.1:5000
echo   Log: backend\startup.log
echo   Press Ctrl+C to stop
echo ============================================
echo.

python app.py

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Server stopped with error!
    echo   Check log: backend\startup.log
    echo ============================================
    echo.
    type startup.log 2>nul
    echo.
)

pause
