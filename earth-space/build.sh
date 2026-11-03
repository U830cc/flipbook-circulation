#!/bin/sh
# ./build.sh          -> flipbook.html (artifact body) and index.html (standalone page)
# ./build.sh dev a 3  -> dev-a.html: part a only, first page index 3, flat 2D harness for checking pages
cd "$(dirname "$0")"
S=src
if [ "$1" = dev ]; then
  L=$(echo "$2" | tr a-z A-Z)
  {
    printf '<!doctype html>\n<html lang="th"><head><meta charset="utf-8"><title>dev %s</title>\n' "$2"
    printf '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Mitr:wght@400;500;600&family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
    printf '<style>body{margin:0;background:#1b2430;font:14px sans-serif;color:#fff}#bar{padding:6px 10px;background:#2b3a4c;white-space:pre-wrap}#view{display:block;height:calc(100vh - 34px);margin:0 auto;touch-action:none}button{position:fixed;top:2px}#prev{right:60px}#next{right:8px}</style></head><body>\n'
    printf '<div id="bar">loading</div><button id="prev">&larr;</button><button id="next">&rarr;</button><canvas id="view" width="900" height="1170"></canvas>\n<script type="module">\n'
    cat $S/helpers.js $S/parts/$2.js
    printf '\nconst DEVPAGES = PART_%s, DEVSTART = %s;\n' "$L" "$3"
    cat $S/harness.js
    printf '</script></body></html>\n'
  } > dev-$2.html
  exit 0
fi
{ cat $S/shell.html $S/helpers.js $S/parts/a.js $S/parts/b.js $S/parts/c.js $S/parts/d.js $S/parts/f.js $S/parts/e.js $S/book.js $S/engine1.js $S/pops.js $S/engine2.js; } > flipbook.html
{ printf '<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat flipbook.html; printf '\n</html>\n'; } > index.html
