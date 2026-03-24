# DQ-272: Player popup headshot hides on error — no fallback initials

**Priority**: P2 — Broken image UX on player hover/click
**Category**: UX / Visual
**Severity**: MEDIUM — Layout shifts when headshot fails to load

## Problem

app.js line 1841 renders player popup headshots with `onerror="this.style.display='none'"`. When the image fails, the 56x56px space collapses to nothing — no fallback element, no initials, just a layout jump.

Compare to `playerHeadshot()` at line 636-637 which correctly shows a fallback span with initials:
```javascript
onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
```

## Fix

Copy the fallback pattern from playerHeadshot() into the popup headshot at line 1841. Add a hidden `<span>` after the `<img>` that shows initials on error:
```javascript
'<img ... onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
'<span style="display:none;width:56px;height:56px;border-radius:50%;background:var(--orange-light);border:2px solid var(--ink);align-items:center;justify-content:center;font-family:var(--font-display);font-size:18px;color:var(--ink);">' + initials + '</span>'
```

## Files
- `frontend/app.js` line 1841
