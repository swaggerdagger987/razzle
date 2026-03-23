# DQ-170: Export PNG buttons have no loading feedback during html2canvas render

**Priority:** P2
**Area:** UX / Export
**Type:** Missing loading state
**Impact:** Users get zero feedback while export renders (1-3s), may click multiple times

---

## Problem

All standalone pages with PNG export buttons call `html2canvas()` on click with no visual feedback. html2canvas takes 1-3 seconds to render complex pages (especially with many player cards, charts, or tables). During this time:

- The button stays in its default state (no disabled, no spinner, no text change)
- User may click again, triggering duplicate renders
- No "capturing..." or "pulling film..." loading personality

### Scale

Every standalone page with an export button has this gap. A grep for `html2canvas` finds 40+ pages with export functionality. None disable the button or show loading state during rendering.

### Example (dashboard.html:602-605)
```javascript
document.getElementById('export-btn').addEventListener('click', function() {
    var el = document.getElementById('db-content');
    if (typeof html2canvas !== 'undefined') {
      html2canvas(el, { ... }).then(function(canvas) {
```

No `btn.disabled = true`, no `btn.textContent = 'capturing...'`, no loading indicator.

## Fix

Wrap every export handler with loading state:
```javascript
var btn = this;
btn.disabled = true;
btn.textContent = 'capturing...';
html2canvas(el, opts).then(function(canvas) {
    // ... download logic ...
}).catch(function(err) {
    console.error('Export failed:', err);
}).finally(function() {
    btn.disabled = false;
    btn.textContent = 'Export PNG';
});
```

Use personality text: "capturing..." or "pulling the shot..."

## Verification
- Click Export PNG on any data-heavy page (dashboard, tradevalues, rankings).
- Button should show loading text and be disabled until render completes.
- Clicking multiple times should not trigger duplicate renders.
