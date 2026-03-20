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

## Root cause (UPDATED 2026-03-20)

**TWO separate bugs, both causing the same symptom:**

### Bug 1: Response cache strips Content-Encoding header (affects LOCAL + PROD)

The response cache middleware (`server.py:465-490`) saves `cache-control` and `content-type` headers but NOT `content-encoding` (line 484). Here's the flow:

1. First request: GZipMiddleware compresses response + adds `Content-Encoding: gzip`
2. Response cache middleware saves gzip bytes but only keeps `cache-control` and `content-type`
3. Second+ requests: cache returns gzip bytes WITHOUT `Content-Encoding: gzip` header
4. Browser receives gzip bytes, thinks it's raw JSON (no encoding header), parse fails

Evidence: `/api/filter-options` returns 728 bytes of gzip data with `Content-Encoding: None` on localhost (no Cloudflare involved). Body starts with `\x1f\x8b` (gzip magic number).

Fix: Add `"content-encoding"` to the allowed headers in line 484:
```python
save_headers = {k: v for k, v in response.headers.items()
               if k.lower() in ("cache-control", "content-type", "content-encoding")}
```

### Bug 2: Double compression on production (Cloudflare layer)

Cloudflare applies Brotli on top of GZip from the server, creating double-compressed responses. This was the original diagnosis but Bug 1 is the primary cause.

Evidence from Playwright response interception:
- `/api/filter-options` response headers: `content-encoding: br` (Brotli from Cloudflare)
- Response body starts with `1f 8b` (gzip magic number) — inner gzip layer not decoded
- Browser's `resp.json()` fails with "Server returned non-JSON response"

**Best fix for both bugs: Remove GZipMiddleware entirely (let Cloudflare handle compression) AND fix the response cache header stripping.**

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

- Production: razzle.lol (BROKEN — double compression + cache header strip)
- Local dev: localhost:8000 (BROKEN — cache header strip, any cached endpoint > 500 bytes)
- Endpoints affected: any GET endpoint in `_RESP_CACHEABLE_PREFIXES` with response > 500 bytes (GZipMiddleware minimum_size)
- Endpoints NOT affected: `/api/health` (not cached), any endpoint on its FIRST request (before being cached)
