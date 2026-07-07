@echo off
REM Tiny launcher - minimal version
cd /d "%~dp0backend"
python -m pip install --quiet -r requirements.txt
python app.py
pause
