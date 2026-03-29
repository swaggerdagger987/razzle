---
id: S3-076
severity: S3
confidence: HIGH
category: content-accuracy
source: DQ-218+221+268+310+281
status: OPEN
---

# Feature list and copy inconsistencies between home, pricing, and agents pages

## Root Cause

Feature descriptions and tier benefits differ across pages:

1. **Pro feature list mismatch** — `frontend/index.html` vs `frontend/pricing.html`: Pro feature descriptions differ, home omits some features that pricing shows (DQ-218)
2. **Duplicate leaguemates copy** — `frontend/index.html`: "leaguemates" section content appears duplicated (DQ-221)
3. **Home elite card omits trial** — `frontend/index.html`: Elite card doesn't mention 7-day free trial that pricing page highlights (DQ-268)
4. **Agents pricing cards missing trial** — `frontend/agents.html`: Situation Room pricing cards don't show trial availability (DQ-310)
5. **Agents CTA hardcodes yearly** — `frontend/agents.html`: CTA buttons only link to yearly checkout, no monthly option (DQ-281)

## Fix

Audit all feature descriptions across index.html, pricing.html, and agents.html. Create a single source of truth for feature lists and tier benefits.

## Files

- `frontend/index.html` — feature cards, elite card, leaguemates section
- `frontend/pricing.html` — feature comparison matrix
- `frontend/agents.html` — Situation Room pricing cards, CTAs

## Acceptance Criteria

- Feature descriptions match across all pages
- Trial availability mentioned consistently
- No duplicate copy blocks
- Both monthly and yearly options visible on CTAs
