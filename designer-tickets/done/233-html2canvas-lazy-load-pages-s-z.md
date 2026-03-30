<!-- PM: ready -->
---
id: DQ-359d
parent: 359 (html2canvas Sync Load Sitewide)
priority: P2
area: frontend standalone HTML pages (S-Z)
section: script tags
type: performance
status: open
depends_on: DQ-359a
---

# Remove sync html2canvas script from pages S-Z, wire lazy loader + verify zero remaining

**Files**: `frontend/scarcity.html`, `frontend/scoring.html`, `frontend/schedule.html`, `frontend/snapefficiency.html`, `frontend/stacks.html`, `frontend/stocks.html`, `frontend/streaks.html`, `frontend/strengths.html`, `frontend/targets.html`, `frontend/tiers.html`, `frontend/tools.html`, `frontend/tradefinder.html`, `frontend/tradevalues.html`, `frontend/usage.html`, `frontend/vorp.html`, `frontend/waivers.html`, `frontend/weekly.html`, `frontend/weeklyleaders.html`, `frontend/weeklymvp.html`, `frontend/yoy.html`

## What to do

1. Remove the sync `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>` tag from each page
2. In each page's export/screenshot function, replace direct `html2canvas()` call with `loadHtml2Canvas().then(h2c => h2c(...))`
3. Final sweep: `grep -rn "html2canvas.hertzen.com" frontend/*.html` should return 0 matches

## Accept when

- Zero sync html2canvas script tags remain in any standalone HTML page
- Export/screenshot still works on spot-checked page (e.g., stocks.html)

## Depends on

DQ-359a (shared loader must exist first)
