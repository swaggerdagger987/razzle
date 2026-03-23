# DES-220: Standalone page headshot images missing width/height attributes (CLS on 18+ pages)

**Priority**: P2 (Layout quality — Cumulative Layout Shift on data tables)
**Pages**: airyards, awards, breakouts, buysell, consistency, efficiency, leaders, matchups, opportunity, redzone, reportcard, schedule, scoring, stocks, team, tradevalues, usage, vorp, yoy (18+ pages)
**Category**: Performance / Visual polish

## The Problem

18+ standalone pages generate player headshot `<img>` elements in JavaScript without HTML `width` and `height` attributes. CSS classes define dimensions (e.g., `.air-headshot { width: 28px; height: 28px; }`), but missing HTML attributes mean the browser doesn't know the image dimensions until CSS loads and the image starts rendering. This causes Cumulative Layout Shift (CLS) — rows jump as headshots load.

Example from airyards.html:489:
```javascript
html += '<img class="air-headshot" src="' + escapeHtml(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
```

Should be:
```javascript
html += '<img class="air-headshot" src="' + escapeHtml(p.headshot_url) + '" alt="" width="28" height="28" loading="lazy" onerror="this.style.display=\'none\'">';
```

## Evidence

DES-200 covered tradefinder.html specifically (4 images). This ticket covers the broader sitewide pattern across 18+ additional pages. The `app.js:playerHeadshot()` function at line 636 CORRECTLY includes `width` and `height` attributes — the standalone pages don't use this shared function.

Pages affected (each generates headshots in JS without width/height):
- airyards.html, awards.html, breakouts.html, buysell.html, consistency.html
- efficiency.html, leaders.html, matchups.html, opportunity.html, redzone.html
- reportcard.html, schedule.html, scoring.html, stocks.html, team.html
- tradevalues.html, usage.html, vorp.html, yoy.html

## The Fix

Add `width="28" height="28"` (or the appropriate size per CSS class) to each JS-generated `<img>` tag. The CSS class already constrains the size — the HTML attributes just prevent layout shift before CSS applies.

## Why This Matters

CLS affects Core Web Vitals (Google ranking signal) and makes data tables feel janky. When a user scrolls through player rankings and rows jump as headshots load, it feels unpolished. These pages ARE the product screenshots that get shared on Reddit.
