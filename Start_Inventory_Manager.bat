@echo off
cd /d "%~dp0"
py -3 inventory_manager.py
if errorlevel 1 (
  echo.
  echo Could not start. Install Python 3 from https://www.python.org/downloads/ and select "Add Python to PATH".
  pause
)
