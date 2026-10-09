Emirates NBD, Corporate & Institutional Banking pages (offline copy)
=====================================================================

82 pages plus the design-system component library, with every image,
video, font, stylesheet and script they use.

HOW TO OPEN
-----------
These pages must be opened through a small local web server.
Double-clicking an .html file will NOT work (images, videos and
components fail to load from file://).

Mac
  1. Double-click "Start (Mac).command".
     First time only: if macOS blocks it, right-click it, choose Open,
     then Open again.
  2. Your browser opens the page list. Keep the Terminal window open
     while browsing; close it to stop.

Windows
  1. Install Python if you do not have it (python.org, tick
     "Add Python to PATH").
  2. Double-click "Start (Windows).bat".

Any computer, by hand
  In a terminal, inside this folder, run:
      python3 -m http.server 8080
  then open  http://localhost:8080/start-here.html

Alternative: open the folder in VS Code and use the "Live Server"
extension on start-here.html.

WHERE TO START
--------------
  start-here.html      list of all 82 pages
  cib-home-final.html  C&IB home page
  index.html           design-system component library

NOTES
-----
- Works offline. A few partner logos and one web font load from the
  internet when you are online.
- Links to pages that are not part of this set show "not found".
