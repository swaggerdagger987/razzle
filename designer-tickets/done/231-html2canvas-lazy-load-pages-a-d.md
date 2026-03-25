<!-- PM: ready -->
---
id: DQ-359b
parent: 359 (html2canvas Sync Load Sitewide)
priority: P2
area: frontend standalone HTML pages (A-D)
section: script tags
type: performance
status: open
depends_on: DQ-359a
---

# Remove sync html2canvas script from pages A-D, wire lazy loader

**Files**: `frontend/advantage.html`, `frontend/airyards.html`, `frontend/aging.html`, `frontend/awards.html`, `frontend/archetypes.html`, `frontend/auction.html`, `frontend/breakouts.html`, `frontend/buysell.html`, `frontend/breakdown.html`, `frontend/cheatsheet.html`, `frontend/career-compare.html`, `frontend/career.html`, `frontend/consistency.html`, `frontend/comptable.html`, `frontend/dashboard.html`, `frontend/draftclass.html`, `frontend/drops.html`

## What to do

1. Remove the sync `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>` tag from each page
2. In each page's export/screenshot function, replace direct `html2canvas()` call with `loadHtml2Canvas().then(h2c => h2c(...))`

## Accept when

- `grep -l "html2canvas.hertzen.com" frontend/a*.html frontend/b*.html frontend/c*.html frontend/d*.html` returns 0 matches
- Export/screenshot still works on spot-checked page (e.g., breakouts.html)

## Depends on

DQ-359a (shared loader must exist first)
