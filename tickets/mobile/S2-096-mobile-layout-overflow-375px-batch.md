---
id: S2-096
severity: S2
confidence: HIGH
category: mobile
source: DQ-294+329+330+334+107
status: OPEN
---

# Mobile layout overflow and cramped UX at 375px — 5 locations

## Root Cause

Multiple UI elements overflow or become unusable at 375px (iPhone SE/mini):

1. **Bureau tabs overflow** — `frontend/league-intel.html`: Tab bar overflows horizontally at 375px, tabs clip or wrap chaotically (DQ-294)

2. **Pricing trial banner fills viewport** — `frontend/pricing.html`: Trial countdown banner takes excessive vertical space on mobile, pushing pricing cards below fold (DQ-329)

3. **Lab toolbar cramped** — `frontend/lab.html`: Toolbar buttons at 375px are too close together, touch targets overlap (DQ-330)

4. **Agents mobile name chips chaotic wrap** — `frontend/agents.html`: Agent name chips wrap unpredictably on narrow viewports (DQ-334)

5. **Lab mobile toolbar unusable** — `frontend/lab.html` at 375px: toolbar filter/sort/column buttons become illegible (DQ-107)

## Fix

Add `@media (max-width: 480px)` rules for each element:
- Bureau tabs: horizontal scroll or stack vertically
- Trial banner: reduce padding, single-line compact mode
- Lab toolbar: icon-only mode or scrollable row
- Agent chips: controlled wrap with gap

## Files

- `frontend/league-intel.html` — tab bar
- `frontend/pricing.html` — trial banner
- `frontend/lab.html` — toolbar
- `frontend/agents.html` — agent name chips

## Acceptance Criteria

- All elements usable at 375px width
- No horizontal overflow or content clipping
- Touch targets remain at minimum 24x24px
