# FUNC-027: Smart filter chip URL key mismatch — "breakouts" vs "breakout"

## Severity: P2
## Status: RESOLVED — Ship Loop commit bfe8a72 changed index.html ?sf=breakouts → ?sf=breakout. Verified session 32.

## Summary

The landing page smart filter chip for "Breakout Candidates" links to `lab.html?sf=breakouts` (with 's'), but the SMART_FILTERS object in lab.js uses the key `breakout` (without 's'). The filter silently fails — no error shown, but no filters are applied.

## Evidence

Landing page (`index.html:708`):
```html
<a href="/lab.html?sf=breakouts" class="smart-chip">Breakout Candidates</a>
```

Lab JS (`lab.js:3543-3544`):
```javascript
const SMART_FILTERS = {
  breakout: {   // <-- key is "breakout", not "breakouts"
```

URL handler (`lab.js:3875`):
```javascript
if (SMART_FILTERS[sfKey]) {  // SMART_FILTERS["breakouts"] === undefined → skip
```

The other 5 chip keys match correctly:
- `buylow` → `buylow` (correct)
- `workhorses` → `workhorses` (correct)
- `sleepers` → `sleepers` (correct)
- `rookies` → `rookies` (correct)
- `studs` → `studs` (correct)

## Fix

Either change the landing page link or the SMART_FILTERS key. Simplest fix — change the link:

```html
<a href="/lab.html?sf=breakout" class="smart-chip">Breakout Candidates</a>
```

## Impact

"Breakout Candidates" is the FIRST smart filter chip on the landing page — the CEO review called these "Razzle's viral content engine." Clicking it opens the Lab with no filters applied, making the user think the feature doesn't work.

## Files
- `frontend/index.html:708` (smart chip href)
- `frontend/lab.js:3543` (SMART_FILTERS key)
