---
id: FUNC-010
severity: P0
flow: all
status: OPEN
file: render deployment
function: service health
created: 2026-03-20
---

# P0: Production service returning 502 — razzle.lol completely down

## What's broken

All API endpoints on razzle.lol return HTTP 502 (Bad Gateway). The Render service is not running or is crashing on startup.

## Evidence

```
$ curl -s -o /dev/null -w "%{http_code}" "https://razzle.lol/api/health"
502

$ curl -s "https://razzle.lol/api/players?limit=1"
<Render 502 error page HTML>
```

Tested at 2026-03-20 19:30 UTC.

## Impact

- **Entire product is down.** No page on razzle.lol functions.
- All API endpoints return 502.
- Users visiting razzle.lol see nothing.
- This supersedes FUNC-006 (undeployed fixes) — even if fixes were deployed, the service itself is down.

## Likely cause

Render service may have:
1. Failed to start (bad deploy, dependency issue)
2. Run out of memory (260MB DB + GZip processing)
3. Hit a startup error (import error, missing env var)

## Fix

**Human action required:**
1. Check Render dashboard for service status and logs
2. If the service crashed, check the most recent deploy logs for errors
3. Restart the service or redeploy from master
4. Verify with: `curl -s "https://razzle.lol/api/health"`

## Verification

```bash
curl -s -o /dev/null -w "%{http_code}" "https://razzle.lol/api/health"
# Should return 200
```
