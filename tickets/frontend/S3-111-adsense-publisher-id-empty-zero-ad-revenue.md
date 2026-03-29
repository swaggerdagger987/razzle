---
id: S3-111
severity: S3
confidence: HIGH
category: configuration
source: evidence-collector-2026-03-14 #15, launch-review-2026-03-14 P1-4
status: OPEN
---

# AdSense publisher ID empty — zero ad revenue from free-tier pages

## Root Cause

`frontend/app.js:1747` has an empty AdSense publisher ID:

```javascript
var ADSENSE_PUB_ID = ""; // e.g., "ca-pub-XXXXXXXXXX"
if (!ADSENSE_PUB_ID) return; // No ads until publisher ID is configured
```

The code correctly guards for the empty ID (returns early, no errors). But ads never display, meaning zero ad revenue from free-tier users. The ad injection function (`_injectAds`, app.js:1745-1770) is fully implemented — it creates the AdSense script tag and inserts ad slots. Only the publisher ID is missing.

The `isPaidUser()` check at app.js:1740 correctly suppresses ads for paid users. Free users would see ads once the ID is configured.

## Fix

1. Register for Google AdSense at https://www.google.com/adsense/
2. Get the publisher ID (format: `ca-pub-XXXXXXXXXX`)
3. Replace empty string in `app.js:1747` with the real ID
4. Verify ads display on free pages but not for Pro/Elite users

## Files to Change

- `frontend/app.js:1747` — set ADSENSE_PUB_ID

## Acceptance Criteria

1. `ADSENSE_PUB_ID` is a valid Google AdSense publisher ID
2. Ads display on pages for anonymous and free-tier users
3. Ads are suppressed for Pro and Elite subscribers
4. No layout shift or CLS impact from ad injection
