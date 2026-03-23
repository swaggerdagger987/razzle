---
id: DQ-209
priority: P2
category: brand / completeness
status: open
---

# Home page (index.html) missing watermark element

## Problem

The `.watermark` CSS class exists in styles.css (position:fixed, bottom-right, Caveat font, "razzle.lol") but index.html has NO `<div class="watermark">` element. Most standalone pages have it. The home page is the MOST likely page to be screenshotted and shared — if someone takes a screenshot of the hero or pricing section to share in a dynasty group chat, there's no brand watermark.

This is distinct from DQ-083 (pricing page missing watermark). This is specifically about the home/landing page.

## Evidence

```bash
grep -c "watermark" frontend/index.html
# 0 results
```

Meanwhile:
- dashboard.html line 364: `<div class="watermark">razzle.lol</div>`
- rankings.html: has watermark
- tiers.html line 308: has watermark
- 22+ other standalone pages: have watermark

## Fix

Add before `</body>` in index.html:

```html
<div class="watermark">razzle.lol</div>
```

The CSS in styles.css already handles all styling (fixed position, Caveat font, opacity).

## Files
- `frontend/index.html` — add watermark div before closing body tag
