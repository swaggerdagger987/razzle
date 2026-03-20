# FUNC-014: esbuild minification not working on production — raw source served

**Severity**: P2
**Flow**: All pages (performance)
**Status**: OPEN

## Problem

Production serves unminified JavaScript and CSS. The `render.yaml` build step runs `npx --yes esbuild frontend/*.js --minify --outdir=frontend/dist/` but the resulting `frontend/dist/` directory either doesn't get created or doesn't persist to runtime.

## Evidence (production, 2026-03-20)

### lab.js served raw on prod
```
$ curl -s "https://razzle.lol/lab.js" | head -c 200
/* Razzle — The Lab (screener logic) */
// escapeHtml and escapeAttr are in app.js (shared)
// ─── Panel Actions (CSV export, Share URL) ───────
function exportPanelCSV(panelName) {
```

### File sizes
| File | Raw | GZipped |
|------|-----|---------|
| lab.js | 520KB | 111KB |

Expected with minification: ~300KB raw, ~75KB gzipped (rough estimate).

## Root Cause

The `render.yaml` buildCommand uses `npx --yes esbuild` which requires Node.js/npm. Render's Python runtime may include Node.js but `npx` may not be available or the command may fail silently without halting the build.

The server code in `backend/server.py` (line 452) correctly checks for `frontend/dist/` and falls back to `frontend/`:
```python
_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_DIR = _DIST_DIR if _DIST_DIR.exists() else Path(__file__).resolve().parent.parent / "frontend"
```

Since the fallback works without errors, the site functions perfectly — just with larger payloads.

## Impact

- Not a functional issue — GZipMiddleware compresses everything, so the 111KB gzipped transfer is acceptable
- Performance gap: could save ~30-40KB compressed per page load with minification
- Source code is readable by anyone (minor IP concern, though this is open-source-ish)

## Suggested Fix

Option A: Add `set -e` to the buildCommand so esbuild failure is caught during deploy
Option B: Install esbuild explicitly: `pip install nodeenv && nodeenv --node=18.0.0 --prebuilt -p && npm install -g esbuild`
Option C: Use a Python-based minifier (rjsmin, csscompressor) that doesn't need Node.js
Option D: Pre-build minified files and commit frontend/dist/ to git (simplest, guaranteed to work)

## Not Affected

- All functionality works identically (confirmed 23 pages, 0 JS errors)
- GZip compression is active and working
- Security headers are correct
