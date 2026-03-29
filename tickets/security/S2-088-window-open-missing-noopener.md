---
id: S2-088
severity: S2
confidence: HIGH
category: security
source: DQ-282
status: OPEN
---

# window.open() calls missing noopener on scatter chart clicks

## Root Cause

Two `window.open()` calls open player profile pages without the `noopener` feature:

1. `frontend/explorer.html:634`:
   ```javascript
   window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank');
   ```

2. `frontend/lab-panels.js:7601`:
   ```javascript
   window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank');
   ```

Every `target="_blank"` HTML link in the codebase correctly uses `rel="noopener"`. These 2 JS window.open() calls are the only exceptions. While same-origin (low security risk), this is inconsistent with the strict security policy applied everywhere else.

## Fix

Add `'noopener'` as the third argument:

```javascript
window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank', 'noopener');
```

## Files

- `frontend/explorer.html:634`
- `frontend/lab-panels.js:7601`

## Acceptance Criteria

- Both window.open() calls include 'noopener' parameter
- Player profile links still open in new tabs
