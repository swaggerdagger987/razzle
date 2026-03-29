---
id: S3-073
severity: S3
confidence: HIGH
category: a11y
source: DQ-208+317+324+333+303
status: OPEN
---

# Contrast failures — 5 badge/heatmap/demo elements below WCAG minimums

## Root Cause

Multiple elements have text-on-background contrast ratios below 4.5:1 (WCAG AA):

1. **Demo briefing cards low contrast** — `frontend/index.html`: demo agent briefing cards have light text on light tinted background in light mode (DQ-208)

2. **Tier 8 trade value badge** — `frontend/tradevalues.html`: lowest tier badge has ~1.2:1 contrast ratio (DQ-317)

3. **Dynasty helper "low" badge** — `frontend/lab-panels.js`: orange badge on orange-tinted row creates orange-on-orange contrast failure (DQ-324)

4. **Weekly heatmap text on tint** — `frontend/weekly.html`: cell text on colored heatmap cells has insufficient contrast at middle tiers (DQ-333)

5. **Agents briefing teaser overlay** — `frontend/agents.html`: teaser overlay text invisible in light mode due to insufficient contrast against background (DQ-303)

## Fix

Darken text or lighten backgrounds to achieve 4.5:1 minimum. For heatmap cells, use dark text on light tints and light text on dark tints (threshold check).

## Files

- `frontend/index.html` — demo cards
- `frontend/tradevalues.html` — tier badge colors
- `frontend/lab-panels.js` — dynasty helper badge
- `frontend/weekly.html` — heatmap cell text
- `frontend/agents.html` — briefing teaser

## Acceptance Criteria

- All 5 elements achieve minimum 4.5:1 contrast ratio
- Heatmap uses adaptive text color based on cell background luminance
