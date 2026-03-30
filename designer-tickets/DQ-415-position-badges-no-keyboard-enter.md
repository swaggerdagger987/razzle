---
id: DQ-415
title: Position breakdown badges have role="button" but no keyboard Enter handler
priority: P2
category: accessibility
page: lab.html
cycle: 53
---

## Problem

The position breakdown badges in the result count bar (QB:12 RB:45 etc.) have `tabindex="0"` and `role="button"` (lab.js:3186) but no `onkeydown` handler. Keyboard-only users can Tab to focus them, but pressing Enter does nothing. The `onclick` fires only on click/pointer events.

## Evidence

```javascript
// lab.js:3186
badges.push('<span role="button" tabindex="0" aria-label="Filter to ' + pp + '" style="..." onclick="togglePosition(\'' + pp + '\')" title="Filter to ' + pp + '">' + pp + ':' + posCounts[pp] + '</span>');
```

No `onkeydown` attribute. Enter key is ignored.

## Fix

Add keyboard handler:
```javascript
'onkeydown="if(event.key===\'Enter\'){togglePosition(\'' + pp + '\')}"'
```

## Files
- `frontend/lab.js` — line 3186
