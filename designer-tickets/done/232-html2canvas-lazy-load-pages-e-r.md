<!-- PM: ready -->
---
id: DQ-359c
parent: 359 (html2canvas Sync Load Sitewide)
priority: P2
area: frontend standalone HTML pages (E-R)
section: script tags
type: performance
status: open
depends_on: DQ-359a
---

# Remove sync html2canvas script from pages E-R, wire lazy loader

**Files**: `frontend/efficiency.html`, `frontend/explorer.html`, `frontend/fptsbreakdown.html`, `frontend/gamelog.html`, `frontend/garbagetime.html`, `frontend/handcuffs.html`, `frontend/matchups.html`, `frontend/opportunity.html`, `frontend/pace.html`, `frontend/percentiles.html`, `frontend/playoffs.html`, `frontend/recap.html`, `frontend/redzone.html`, `frontend/regression.html`, `frontend/records.html`, `frontend/reportcard.html`, `frontend/rosterbuilder.html`

## What to do

1. Remove the sync `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>` tag from each page
2. In each page's export/screenshot function, replace direct `html2canvas()` call with `loadHtml2Canvas().then(h2c => h2c(...))`

## Accept when

- `grep -l "html2canvas.hertzen.com" frontend/e*.html frontend/f*.html frontend/g*.html frontend/h*.html frontend/m*.html frontend/o*.html frontend/p*.html frontend/r*.html` returns 0 matches
- Export/screenshot still works on spot-checked page

## Depends on

DQ-359a (shared loader must exist first)
