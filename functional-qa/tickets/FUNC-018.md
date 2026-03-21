# FUNC-018: SEO routes /player/{id}, /compare/{id1}/{id2}, /team/{abbr} serve broken pages

**Severity**: P1
**Flow**: Player Profile (flow 13), Player Comparison (flow 16), Team Pages (new)
**Status**: NEW

## Problem

Three server-side routes serve HTML pages with dynamic OG tags for social sharing and SEO:
- `/player/{player_id:path}` (server.py:2135)
- `/compare/{id1}/{id2}` (server.py:2204)
- `/team/{abbr}` (server.py:2257)

All three read their respective HTML files and return them via `HTMLResponse`. The HTML files reference assets with **relative paths** (`href="styles.css"`, `src="app.js"`, etc.). When the browser is at `/player/00-0036945`, it resolves `styles.css` to `/player/styles.css`, which hits the same `/player/{player_id:path}` route and returns HTML with `text/html` MIME type. The browser refuses to execute it.

**Result**: All three page types are completely non-functional when accessed via their SEO URLs. Users see "pulling film..." loading state forever. No CSS, no JS, no data.

## Evidence (Production)

### /player/00-0033280 (McCaffrey)
```
JS_ERRORS: 3
  Refused to execute script 'https://razzle.lol/player/app.js' (MIME type 'text/html')
  Refused to apply style 'https://razzle.lol/player/styles.css' (MIME type 'text/html')
  Refused to execute script 'https://razzle.lol/player/player.js' (MIME type 'text/html')
```

### /compare/00-0036945/00-0039075 (Jackson vs Nacua)
```
JS_ERRORS: 3
  Refused to apply style 'https://razzle.lol/compare/00-0036945/styles.css' (MIME type 'text/html')
  Refused to execute script 'https://razzle.lol/compare/00-0036945/app.js' (MIME type 'text/html')
  Refused to execute script 'https://razzle.lol/compare/00-0036945/compare.js' (MIME type 'text/html')
```

### /team/PHI
```
JS_ERRORS: 2
  Refused to apply style 'https://razzle.lol/team/styles.css' (MIME type 'text/html')
  Refused to execute script 'https://razzle.lol/team/app.js' (MIME type 'text/html')
```

## Impact

- **Social sharing is broken**: The OG tags are injected for Reddit/Twitter/Discord previews, but anyone who clicks the shared link lands on a non-functional page. This directly undermines the "get screenshotted on Reddit" goal.
- **Internal navigation from standalone pages is broken**: 10+ standalone pages (buysell.html, airyards.html, aging.html, breakouts.html, consistency.html, awards.html, efficiency.html, draftclass.html, explorer.html, compare.js) link to `/player/{id}` via click handlers.
- **The Lab screener is NOT affected**: It uses `openPlayerPopup()` overlays, not full page navigation. So the main UX flow works, but any deeper exploration from standalone panels is broken.

## Relative paths that break

### player.html
- Line 19: `href="favicon.svg"`
- Line 23: `href="styles.css"`
- Line 411: `src="app.js"`
- Line 412: `src="player.js"`

### compare.html
- Line 23: `href="styles.css"`
- Line 410: `src="app.js"`
- Line 411: `src="compare.js"`

### team.html
- Line 19: `href="favicon.svg"`
- Line 23: `href="styles.css"`
- Line 386: `src="app.js"`

## Suggested Fix

**Option A (simplest)**: Add `<base href="/">` to the `<head>` of player.html, compare.html, and team.html. This tells the browser to resolve all relative URLs from `/`, fixing the path resolution without changing any other references.

```html
<head>
<base href="/">
<meta charset="UTF-8">
...
```

**Option B**: Change relative paths to absolute in all three files:
- `href="styles.css"` → `href="/styles.css"`
- `src="app.js"` → `src="/app.js"`
- `src="player.js"` → `src="/player.js"`
- etc.

**Option C**: Have the server inject `<base href="/">` into the HTML response before returning it (only needed for the dynamic routes, not the static file serve).

Recommendation: **Option A** — simplest, least invasive, fixes all relative paths at once.

## Not Affected

- `player.html?id=X` (direct static file access) — works fine
- `compare.html?id1=X&id2=Y` — works fine
- `team.html?abbr=X` — works fine
- Lab screener player popups — work fine (never navigate away)

## Files

- `frontend/player.html` (add `<base href="/">`)
- `frontend/compare.html` (add `<base href="/">`)
- `frontend/team.html` (add `<base href="/">`)
