---
id: S3-033
severity: S3
category: ui-bug
finding_ref: EDGE-68
confidence: MEDIUM
---

# S3-033: Hover card positioning ignores scroll offset

## Root Cause

`frontend/lab.js:2249-2265`:
```javascript
const rect = anchorEl.getBoundingClientRect();
let top = rect.bottom + 8;
let left = rect.left;
// ... viewport clamping ...
card.style.top = top + "px";
card.style.left = left + "px";
```

`getBoundingClientRect()` returns viewport-relative coordinates. If the hover card
uses `position: absolute` (relative to a scrollable container), assigning viewport
coordinates directly causes misplacement when the page is scrolled.

If the card uses `position: fixed`, this code is correct. Need to verify the card's
CSS position property.

## What to Fix

Option A (if `position: absolute`): Add scroll offset:
```javascript
card.style.top = (top + window.scrollY) + "px";
card.style.left = (left + window.scrollX) + "px";
```

Option B (if `position: fixed`): Code is already correct, mark as STALE.

Check `styles.css` for `.hover-card` or equivalent class to determine position type.

## Files to Change

- `frontend/lab.js` — Lines 2263-2264, add scroll offset if position is absolute

## Acceptance Criteria

- [ ] Hover card appears directly below the anchor element regardless of scroll position
- [ ] Card stays within viewport bounds (existing clamping logic preserved)

## Do NOT

- Do not change the card from fixed to absolute or vice versa without testing both states
