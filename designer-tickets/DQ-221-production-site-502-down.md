---
id: DQ-221
title: Production site returns 502 — razzle.lol is completely down
priority: P0
category: infrastructure
status: open
cycle: 32
---

## Problem

`curl -s -o /dev/null -w "%{http_code}" https://razzle.lol` returns 502. The site is completely inaccessible to any visitor. Headless browser renders blank white page. No network requests fire — the server is not responding.

This is a P0 launch blocker. Nothing else matters if the site is down.

## Evidence

Tested at 2026-03-23. curl returns HTTP 502 Bad Gateway. Headless Chromium gets 200 but receives empty `<html><head></head><body></body></html>` (Render's default error page).

## Fix

1. Check Render dashboard for deploy status and server logs
2. Likely causes: server crash on startup (env var missing, DB download failure, Python import error)
3. Check `render.yaml` for correct build/start commands
4. Verify GitHub release `data-v1` still has terminal.db downloadable
5. Check if the Render service has been suspended (free tier inactivity?)

## Files
- `render.yaml` (deploy config)
- `backend/server.py` (startup logic)
