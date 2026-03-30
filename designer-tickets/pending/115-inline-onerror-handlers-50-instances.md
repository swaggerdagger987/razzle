# DES-115: 50 inline `onerror` handlers on images across 25 files

**Priority**: P2 — CSP compatibility, code maintainability
**Category**: Code quality, security

## Problem

50 instances of inline `onerror="this.style.display='none'"` on `<img>` elements across 25 files. This pattern:
1. Violates Content Security Policy `script-src` without `unsafe-inline`
2. Is duplicated 50 times (DRY violation)
3. Can't be updated centrally (e.g., if you want to show a placeholder instead of hiding)

## Affected Files (25)

app.js (2), airyards.html (1), awards.html (2), breakouts.html (1), buysell.html (1), consistency.html (1), efficiency.html (1), lab-panels.js (19), leaders.html (1), matchups.html (1), opportunity.html (1), player.js (1), redzone.html (1), lab.js (3), reportcard.html (1), rosterbuilder.html (1), schedule.html (1), scoring.html (1), stocks.html (1), team.html (1), tradefinder.html (4), tradevalues.html (1), usage.html (1), vorp.html (1), yoy.html (1)

## Evidence

```html
<img src="..." alt="" loading="lazy" onerror="this.style.display='none'">
```

Same pattern, 50 times.

## Fix

1. Add a shared function to `app.js`:
```js
function onImgError(el) { el.style.display = 'none'; }
```

2. Replace all inline handlers:
```html
<img src="..." alt="" loading="lazy" onerror="onImgError(this)">
```

Or better — use a delegated event listener in app.js:
```js
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG' && e.target.classList.contains('player-headshot')) {
    e.target.style.display = 'none';
  }
}, true);
```

This removes ALL inline onerror handlers and makes the pattern CSP-safe.

## Why This Matters

If Razzle adds CSP headers (which it should for security), all 50 inline onerror handlers will break, showing broken image icons across every data panel. Fix now while it's cheap.
