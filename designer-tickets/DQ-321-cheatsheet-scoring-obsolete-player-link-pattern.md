---
id: DQ-321
title: cheatsheet.html + scoring.html use obsolete /player.html?id= link pattern
priority: P1
category: broken-navigation
page: cheatsheet.html, scoring.html
---

## Problem
Two pages navigate to player profiles using `/player.html?id=` (query param pattern), while all other 28+ pages use `/player/{id}` (path pattern). The server route is `@app.get("/player/{player_id:path}")` — path-based.

**cheatsheet.html line 461:**
```js
window.location.href = '/player.html?id=' + encodeURIComponent(el.dataset.pid);
```

**scoring.html line 515:**
```js
window.location.href = '/player.html?id=' + encodeURIComponent(el.dataset.pid);
```

**Every other page (28+):**
```js
window.location.href = '/player/' + encodeURIComponent(pid);
```

If `player.html` is ever removed or the server stops serving it directly, these two pages break silently. Users clicking player names on cheatsheet or scoring comparison land on a different URL than bookmarks from other pages — bad for sharing.

## Expected
All pages use `/player/{id}` consistently.

## Fix
- `frontend/cheatsheet.html` line 461: change `/player.html?id=` to `/player/`
- `frontend/scoring.html` line 515: change `/player.html?id=` to `/player/`

Two string replacements.

## Files
- `frontend/cheatsheet.html`
- `frontend/scoring.html`
