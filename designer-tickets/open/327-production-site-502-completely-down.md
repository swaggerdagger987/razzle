---
id: DES-327
priority: P0
area: infrastructure
section: production deployment
type: outage
status: open
---

# Production site razzle.lol returns 502 — completely unreachable

## What's wrong

razzle.lol returns a 502 Bad Gateway error. The entire production site is a blank white page. No HTML is served. The Render deployment is not responding.

This means zero visitors can see any page. Every Reddit link, every shared URL, every OG image preview resolves to nothing. The site is effectively offline.

## Where

https://razzle.lol — tested 2026-03-23. All routes return 502.

## Evidence

- `$B goto https://razzle.lol` returned HTTP 502
- Screenshot shows blank white page
- Local server at 127.0.0.1:8000 serves correctly — the code is fine, the deployment is broken

## Suggested fix

1. Check Render dashboard for deploy errors, build failures, or service crashes
2. Check if the DB download step in the build is failing (terminal.db is built from GitHub release on each deploy)
3. Redeploy manually if the service is in a stuck state
4. Consider adding a health check endpoint monitor (e.g., UptimeRobot) to catch this faster next time

## Why this matters

Everything else is academic if nobody can see the site. This is the #1 priority — above all design, copy, and UX tickets.
