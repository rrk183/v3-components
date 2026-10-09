#!/bin/bash
# Serves this folder locally and opens the page list in your browser.
cd "$(dirname "$0")" || exit 1
PORT=8080
while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT+1)); done
echo "Serving on http://localhost:$PORT  (close this window to stop)"
( sleep 1; open "http://localhost:$PORT/start-here.html" ) &
python3 -m http.server $PORT
