#!/bin/sh
# Wraps the artifact body (flipbook.html) into a standalone index.html for local use or static hosting.
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat flipbook.html; printf '\n</html>\n'; } > index.html
