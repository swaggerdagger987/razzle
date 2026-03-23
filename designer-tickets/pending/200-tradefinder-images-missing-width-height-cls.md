# DES-200: tradefinder.html headshot images missing width/height attributes — 4 images cause CLS

**Priority**: P2
**Category**: Performance / Mobile UX
**Affects**: tradefinder.html — Trade Finder panel (Bones territory)
**Cycle**: 19

## Problem

Four `<img>` tags in tradefinder.html's JavaScript lack `width` and `height` HTML attributes. Without intrinsic dimensions, the browser can't reserve space before the image loads, causing Cumulative Layout Shift (CLS) — the page content jumps around as headshots pop in. This is especially jarring on mobile where the Trade Finder loads results dynamically.

## Evidence

`tradefinder.html:610` (autocomplete suggestion):
```javascript
html += '<img class="tf-ac-img" src="' + escapeHtml(p.headshot_url) + '" alt="" onerror="this.style.display=\'none\'">';
```

`tradefinder.html:664` (selected player headshot):
```javascript
errHtml += '<img class="tf-sel-headshot" src="' + escapeHtml(data.headshot_url) + '" alt="" onerror="this.style.display=\'none\'">';
```

`tradefinder.html:758` (result row):
```javascript
html += '<img class="tf-row-img" src="' + escapeHtml(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
```

`tradefinder.html:808` (selected player B):
```javascript
html += '<img class="tf-sel-headshot" src="' + escapeHtml(sel.headshot_url) + '" alt="" onerror="this.style.display=\'none\'">';
```

Compare with correct patterns elsewhere:
- `lab.html:4203`: `<img src="..." width="12" height="12" alt="">`
- `agents.html:1633`: `<img src="..." width="28" height="28" alt="">`

## Fix

Add `width` and `height` attributes matching the CSS dimensions:
- `tf-ac-img`: check CSS for rendered size, add matching attributes
- `tf-sel-headshot`: check CSS for rendered size, add matching attributes
- `tf-row-img`: check CSS for rendered size, add matching attributes

Also add `loading="lazy"` to the 3 instances that are missing it (line 610, 664, 808 — only line 758 has it).

## Why it matters

Trade Finder is a conversion-path tool — users search for players and see equal-value trade targets. Layout shift during search makes the tool feel unpolished. Google's Core Web Vitals penalizes CLS, and Reddit users sharing Trade Finder screenshots will notice the jank on mobile.
