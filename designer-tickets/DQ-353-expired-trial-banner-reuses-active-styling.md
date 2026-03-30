---
id: DQ-353
title: Expired trial banner reuses active trial orange styling with "ended" text
priority: P2
category: UX / state clarity
page: pricing.html
cycle: 46
---

## Problem

When a user's trial expires, pricing.html (lines 713-717) shows the same `trialActiveBanner` element used for active trials, but changes the title to "Your Pro Trial Has Ended":

```js
if (trialActiveBanner) {
  trialActiveBanner.style.display = 'block';
  var bannerTitle = document.getElementById('trialBannerTitle');
  if (bannerTitle) bannerTitle.textContent = 'Your Pro Trial Has Ended';
  if (trialCountdown) trialCountdown.textContent = 'subscribe to keep Pro access';
}
```

The banner has `background:var(--orange-light)` and `border:3px solid var(--orange)` — warm, active, positive styling. But the message says the trial has ENDED. This creates a mixed signal: orange says "things are good," text says "you've lost access."

## Expected

Expired trial should use a distinct visual treatment:
- Muted background (e.g., `var(--bg-warm)` instead of `var(--orange-light)`)
- Different border color (e.g., `var(--ink-faint)` instead of `var(--orange)`)
- Clear urgency: "Your free trial ended. Subscribe to restore Pro access."

## Fix

Add a separate expired trial state:
```js
if (isExpiredTrial) {
  if (trialActiveBanner) {
    trialActiveBanner.style.display = 'block';
    trialActiveBanner.style.background = 'var(--bg-warm)';
    trialActiveBanner.style.borderColor = 'var(--ink-faint)';
    if (bannerTitle) bannerTitle.textContent = 'Your Free Trial Has Ended';
    if (trialCountdown) trialCountdown.textContent = 'subscribe to restore Pro features';
  }
}
```

## Files
- `frontend/pricing.html` (lines 706-718)
