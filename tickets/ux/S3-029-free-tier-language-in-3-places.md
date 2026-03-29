---
id: S3-029
severity: S3
category: brand-voice
finding_ref: EDGE-55
confidence: HIGH
---

# S3-029: "free tier" language used in 3 places

## Root Cause

1. `frontend/lab.js:10363`:
```javascript
html += '<p ...>drag-free tier assignment — use dropdowns to move players between tiers</p>';
```
This is actually "drag-free" (meaning no dragging required), not "free tier". But
the phrasing is ambiguous and reads like "free tier".

2. `frontend/warroom.js:2660`:
```javascript
return 5; // free tier
```
Code comment. Not user-visible but sets wrong tone in codebase.

3. `frontend/pricing.html:244`:
```html
<!-- What everyone gets — free tier celebration -->
```
HTML comment. Not user-visible but same issue.

## What to Fix

1. `lab.js:10363` — Change "drag-free tier assignment" to "drag-and-drop tier assignment"
   (clearer, avoids "free tier" reading)
2. `warroom.js:2660` — Change comment to `// free plan query limit`
3. `pricing.html:244` — Change comment to `<!-- What everyone gets -->`

## Files to Change

- `frontend/lab.js` — Line 10363
- `frontend/warroom.js` — Line 2660
- `frontend/pricing.html` — Line 244

## Acceptance Criteria

- [ ] Zero instances of "free tier" in user-visible text or comments
- [ ] lab.js phrasing is unambiguous

## Do NOT

- Do not rename the Free plan itself — "Free" is fine, "free tier" is not
