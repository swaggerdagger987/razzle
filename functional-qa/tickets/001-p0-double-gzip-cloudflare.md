---
id: FUNC-001
severity: P0
flow: 1 (Landing -> Lab)
status: OPEN
file: backend/server.py
function: GZipMiddleware + Cloudflare
created: 2026-03-20
---

# P0: Double compression breaks Lab init — GZipMiddleware + Cloudflare Brotli

## What's broken

The Lab page fails to initialize on production (razzle.lol) because `/api/filter-options` returns gzip-compressed bytes that the browser can't parse as JSON.

## Root cause

The FastAPI server has `GZipMiddleware` that compresses responses with gzip and sets `Content-Encoding: gzip`. Cloudflare then applies its own compression (Brotli `br`), creating a double-compressed response. When the browser decompresses the outer Brotli layer, it gets raw gzip bytes instead of JSON.

Evidence from Playwright response interception:
- `/api/filter-options` response headers: `content-encoding: br` (Brotli from Cloudflare)
- Response body starts with `1f 8b` (gzip magic number) — inner gzip layer not decoded
- Browser's `resp.json()` fails with "Server returned non-JSON response"

Contrast with `/api/college/filter-options` which showed `content-encoding: gzip` and decoded correctly.

## Impact

- Lab page shows empty screener on production (no player data)
- `populateSeasonSelect` crashes: `Cannot set properties of null (setting 'innerHTML')`
- Affects ALL users loading lab.html on razzle.lol through Cloudflare
- Landing page and static content unaffected (no API calls)

## Cascade errors

1. `Failed to load NFL filter options: Server returned non-JSON response` (app.js:476)
2. `Cannot set properties of null (setting 'innerHTML')` (lab.js:2877) — #seasonSelect not in DOM yet
3. Page crash: `Cannot read properties of null (reading 'classList')` — downstream null

## Fix options

**Option A (recommended):** Remove `GZipMiddleware` from the FastAPI server. Let Cloudflare handle all compression. Cloudflare's edge compression is superior (Brotli, better cache integration) and doesn't cause double-compression.

**Option B:** Set `Cache-Control: no-transform` on API responses to prevent Cloudflare from re-compressing.

**Option C:** Configure Cloudflare to pass through already-compressed responses (requires Cloudflare dashboard).

## Reproduction

```bash
# Shows gzip bytes even though content-encoding says "br"
curl -s -D- "https://razzle.lol/api/filter-options" | head -20

# Shows correct JSON when decompressed manually
curl -s --compressed "https://razzle.lol/api/filter-options" | python3 -c "import sys,gzip; print(gzip.decompress(sys.stdin.buffer.read()).decode()[:100])"
```

Or: open razzle.lol/lab.html in browser → DevTools console shows the error.

## Verified against

- Production: razzle.lol (BROKEN)
- Local dev: localhost:8000 (WORKS — no Cloudflare proxy)
