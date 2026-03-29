---
id: S3-083
severity: S3
confidence: MEDIUM
category: design-polish
source: DQ-192+224+237+311+331+332+335+114+179
status: OPEN
---

# Design polish batch — shadows, badges, fonts, scroll indicators

## Root Cause

Multiple low-priority design inconsistencies:

1. **Hero drop shadow 3px not 4px** — `frontend/index.html`: mascot/hero drop shadow uses 3px offset instead of spec'd 4px (DQ-192)
2. **Pricing badge rotation -2deg not -3deg** — `frontend/pricing.html`: badge rotation angle doesn't match DESIGN.md spec of -3deg (DQ-224)
3. **Caveat font below 18px minimum** — sitewide: 97 instances of Caveat font used at sizes below 18px; handwriting font becomes illegible small (DQ-237)
4. **Agents Caveat 14px in briefing** — `frontend/agents.html`: briefing UI uses Caveat at 14px, below readability threshold (DQ-311)
5. **Pricing plan cards missing 6px top stripe** — `frontend/pricing.html`: plan cards lack the 6px colored top stripe per design spec (DQ-331)
6. **Tiers tier labels not rotated** — `frontend/tiers.html`: tier letter badges not rotated per sticker aesthetic spec (DQ-332)
7. **Dashboard lacks Caveat personality** — `frontend/dashboard.html`: no handwritten annotations/personality text (DQ-335)
8. **No scroll indicators on overflow tables** — sitewide: tables with horizontal scroll have no visual affordance indicating scrollability (DQ-114)
9. **webkit-overflow-scrolling:touch dead CSS** — sitewide: 78 instances of deprecated `-webkit-overflow-scrolling: touch` that does nothing in modern browsers (DQ-179)

## Fix

Each is an independent CSS/design tweak. Prioritize Caveat font size enforcement (DQ-237) as it affects readability.

## Files

- `frontend/index.html` — hero shadow
- `frontend/pricing.html` — badge rotation, plan card stripe
- Sitewide — Caveat font sizes, overflow indicators
- `frontend/tiers.html` — badge rotation
- `frontend/dashboard.html` — personality annotations

## Acceptance Criteria

- Caveat font never used below 18px
- Badge rotations match DESIGN.md
- Overflow tables have scroll shadow/gradient indicator
- Dead webkit CSS removed
