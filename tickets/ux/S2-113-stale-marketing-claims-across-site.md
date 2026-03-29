---
id: S2-113
severity: S2
confidence: MEDIUM
category: ux
source: DQ-128+156+295+380+474+475+481+485+486+489
status: OPEN
---

# Stale and misleading marketing claims across 10+ pages

## Problems

1. **3 hardcoded year references** (DQ-128) — "2024" or "2025" hardcoded in JS/HTML that will be stale in 2026. Should use dynamic year helpers.

2. **Demo content shows "2024 Season"** (DQ-156) — Two years out of date. Landing page demo data should use current/latest season.

3. **Home `<title>` missing "Free"** (DQ-295) — `<title>` says "Razzle — Fantasy Football Analytics" while `og:title` says "Razzle — Free Fantasy Football Analytics". Inconsistent.

4. **records.html meta hardcodes "since 2020"** (DQ-380) — Meta description will be stale. Should say "since 2015" (actual data range) or use dynamic text.

5. **tools.html says "60+"** (DQ-474) — Should be "70+" to match actual panel count.

6. **"Yahoo support coming soon" undated** (DQ-475) — `league-intel.html` — stale promise with no timeline. Either add a date or remove.

7. **app.js Pro upsell says "60+ analytical panels"** (DQ-481) — Should be "70+".

8. **"Weekly Razzle briefings" claimed** (DQ-485) — Home and pricing pages promise this feature. Verify it actually exists and works for Pro users.

9. **"Priority data refresh" claimed** (DQ-486) — Home and pricing pages list this as a Pro feature. Feature may not be implemented.

10. **OG meta says "AI agents with full league context"** (DQ-489) — Misleading for free tier users who don't get league context.

## Fix

Replace hardcoded counts with dynamic helpers or update to correct numbers. Remove or date promises for unbuilt features. Align meta descriptions with actual capabilities per tier.

## Files (specific locations)

- `frontend/app.js:826,833` — `"All 60+ analytical panels"` (should be 70+)
- `frontend/records.html:21` — `<meta name="description" content="...since 2020.">` (should be "since 2015")
- `frontend/league-intel.html:2589` — `Yahoo</span> support coming soon` (undated promise)
- `frontend/index.html` — demo data season, title tag, feature claims (multiple locations)
- `frontend/pricing.html` — feature claims ("Weekly Razzle briefings", "Priority data refresh")
- `frontend/tools.html` — panel count (should be 70+)

## Acceptance Criteria

1. No hardcoded year that will go stale
2. Panel counts say "70+" consistently
3. Unbuilt features either removed from marketing or labeled "coming soon" with date
4. OG/meta descriptions accurate for free tier experience
