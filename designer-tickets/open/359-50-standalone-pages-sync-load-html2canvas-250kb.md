---
id: DQ-359
priority: P2
area: 50+ standalone HTML pages
section: script loading
type: performance
status: open
---

# 50+ standalone pages synchronously load html2canvas (250KB blocking script)

## What's wrong

Phase B-7 fixed this for lab.js — html2canvas is now lazy-loaded on first screenshot request. But 50+ standalone pages still have a synchronous `<script>` tag loading the full 250KB library on every page load, even though most users never take a screenshot.

This adds ~250KB of blocking JavaScript to every standalone page's critical render path.

## Where

Every standalone page has this pattern near the bottom:
```html
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
```

50+ files including: advantage.html, airyards.html, aging.html, awards.html, archetypes.html, auction.html, breakouts.html, buysell.html, breakdown.html, cheatsheet.html, career-compare.html, dashboard.html, consistency.html, draftclass.html, efficiency.html, comptable.html, explorer.html, gamelog.html, fptsbreakdown.html, career.html, handcuffs.html, matchups.html, opportunity.html, pace.html, percentiles.html, playoffs.html, recap.html, redzone.html, regression.html, records.html, scarcity.html, reportcard.html, stacks.html, scoring.html, rosterbuilder.html, stocks.html, schedule.html, streaks.html, strengths.html, targets.html, tiers.html, tradefinder.html, tools.html, tradevalues.html, vorp.html, usage.html, weeklyleaders.html, weekly.html, waivers.html, weeklymvp.html, yoy.html

## Suggested fix

Apply the same lazy-load pattern from lab.js to all standalone pages. Create a shared `loadHtml2Canvas()` function in app.js:

```javascript
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const s = document.createElement('script');
    s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    s.onload = () => resolve(window.html2canvas);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
```

Then remove the `<script>` tag from all 50+ pages and call `loadHtml2Canvas()` inside each page's export/screenshot function.

## Why this matters

250KB x 50+ pages = every standalone page loads slower than it needs to. Most visitors never screenshot. This is the lowest-effort, highest-impact performance win remaining.
