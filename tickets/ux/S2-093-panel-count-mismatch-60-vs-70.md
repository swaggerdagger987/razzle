---
id: S2-093
severity: S2
confidence: HIGH
category: content-accuracy
source: DQ-230+159
status: OPEN
---

# Panel count mismatch: app.js says "60+" but pricing.html says "70+"

## Root Cause

`frontend/app.js:826,833`:
```javascript
"All 60+ analytical panels"
```

`frontend/pricing.html:250`:
```html
<span class="free-chip">70+ analytical panels (preview)</span>
```

`frontend/pricing.html:357`:
```html
70+ analytical panels (dynasty rankings, trade values, breakouts, aging curves, and more)
```

Marketing material is inconsistent. The welcome modal (app.js) undersells the product compared to the pricing page. Users who see "60+" in the welcome modal and then "70+" on pricing may notice the discrepancy.

## Fix

Audit actual panel count and update all references to the same number. Grep for "60+" and "70+" across all HTML and JS files.

## Files

- `frontend/app.js:826,833` — welcome modal text
- `frontend/pricing.html:250,357` — pricing page feature lists

## Acceptance Criteria

- All panel count references use the same accurate number
- Welcome modal, pricing page, home page, and any other marketing copy are consistent
