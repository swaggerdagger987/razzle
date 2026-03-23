# DQ-108: Standalone pages with very long scroll — no back-to-top button

**Priority**: P3
**Category**: Navigation UX
**Severity**: Low — usability friction on longest pages
**Evidence**: Visual — trade values page screenshot shows 200+ player rows with no scroll navigation. Code search: only 1 `scrollToTop` instance (lab.js), zero on standalone pages.

## What's wrong

Several standalone pages are extremely long vertical scrolls:
- **tradevalues.html** — 200+ players in a single list, 20+ screens of scrolling
- **rankings.html** — 100+ player chips across 8 tier sections
- **weekly.html** — player x week grid, very tall
- **leaders.html** — multiple stat categories stacked

Once users scroll deep into these pages, there's no way to return to the top except manual scrolling. The Lab has a `scrollToTop` function, but standalone pages don't.

## Where

- All 66+ standalone HTML pages in `frontend/` — zero back-to-top buttons
- Only `frontend/lab.js` has scroll-to-top logic

## Fix

Add a floating back-to-top button to `frontend/styles.css` + a small shared JS snippet:

```css
.back-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border: 2px solid var(--ink);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: 4px 4px 0 var(--ink);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 100;
}
.back-to-top.visible { opacity: 1; }
```

Show after scrolling past 2 viewport heights. Apply to all standalone pages.

## Verification

Open tradevalues.html. Scroll past 3 screens. A chunky back-to-top button appears in bottom-right corner.
