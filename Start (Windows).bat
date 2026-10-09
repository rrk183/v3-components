@echo off
cd /d "%~dp0"
echo Serving on http://localhost:8080  (close this window to stop)
start "" "http://localhost:8080/start-here.html"
python -m http.server 8080 || py -m http.server 8080
pause
