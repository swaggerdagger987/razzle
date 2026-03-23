# DES-246: Home page mini-screener has no loading skeleton while API loads

**Priority:** P2 — first impression
**Page:** index.html lines 670-690, 1018-1036
**Cycle:** 23

## Problem

The home page mini-screener fetches live data from `/api/players?limit=60&sort=ppg&order=desc` on page load. While the API responds, the table body shows:

```html
<tr id="miniScreenerPlaceholder"><td colspan="6" style="text-align:center; padding:24px; font-family:var(--font-hand); font-size:20px; color:var(--ink-light);">pulling film...</td></tr>
```

This is good personality text, but it's a single static row in a 6-column table. On slow connections (mobile, first visit, cold API), the mini-screener section looks empty — a single line of text in a large white box. No skeleton rows, no shimmer animation, no visual indication that real data is coming.

The Lab screener (lab.html) has a proper loading skeleton with pulsing placeholder rows. The home page mini-screener doesn't.

## Fix

Add 3-5 skeleton rows with pulsing animation while data loads:

```html
<tr class="skeleton-row">
  <td><div class="skeleton-cell" style="width:20px;"></div></td>
  <td><div class="skeleton-cell" style="width:30px;"></div></td>
  <td><div class="skeleton-cell" style="width:100px;"></div></td>
  <td><div class="skeleton-cell" style="width:40px;"></div></td>
  <td><div class="skeleton-cell" style="width:30px;"></div></td>
  <td><div class="skeleton-cell" style="width:40px;"></div></td>
</tr>
```

Keep the "pulling film..." text as the first skeleton row or above the skeleton.

## Why this matters

The mini-screener is the first live data element visitors see on the home page. It demonstrates that Razzle has real, current NFL data — not a static mockup. A loading skeleton signals "real data is coming" much more effectively than a single text line. First impressions drive whether a visitor scrolls to the Screener CTA.
