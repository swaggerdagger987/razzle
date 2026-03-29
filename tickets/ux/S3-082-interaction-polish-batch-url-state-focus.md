---
id: S3-082
severity: S3
confidence: MEDIUM
category: ux-flow
source: DQ-287+291+255+226+266+270+201+292+186
status: OPEN
---

# Interaction polish batch — URL state, focus management, deep links

## Root Cause

Multiple interaction patterns missing polish:

1. **Bureau tabs no URL deeplink** — `frontend/league-intel.html`: switching bureau tabs doesn't update URL, can't share specific tab (DQ-287)
2. **Selected players not in URL** — `frontend/lab.js`: player selections not serialized to URL params (DQ-291)
3. **Pricing interval toggle not in URL** — `frontend/pricing.html`: monthly/yearly toggle state not in URL (DQ-255)
4. **Mini-screener rows link generic Lab** — `frontend/index.html`: clicking mini-screener row navigates to generic Lab instead of player (DQ-226)
5. **Home no skip-to-pricing for returning visitors** — `frontend/index.html`: no anchor link to jump directly to pricing section (DQ-266)
6. **Footer "Made for Reddit" not a link** — `frontend/`: tagline mentions Reddit but isn't a hyperlink (DQ-270)
7. **Blurred pro teaser keyboard focusable** — `frontend/lab.html`: blurred Pro content behind gate is still keyboard-focusable (DQ-201)
8. **Lab modals no focus return** — `frontend/lab.js`: closing modals doesn't return focus to trigger element (DQ-292)
9. **Home hero anchor no smooth scroll** — `frontend/index.html`: feature section link doesn't smooth scroll (DQ-186)

## Fix

- Serialize tab/filter/toggle state to URL params
- Add focus return to modal close handlers
- Add `inert` attribute to blurred content
- Add smooth scroll to anchor links

## Files

- `frontend/league-intel.html` — tab URL state
- `frontend/lab.js` — player selection URL, modal focus
- `frontend/pricing.html` — interval toggle URL
- `frontend/index.html` — mini-screener links, smooth scroll
- `frontend/lab.html` — inert on blurred content

## Acceptance Criteria

- Bureau tab selection reflected in URL
- Modal close returns focus to trigger
- Blurred content not keyboard-accessible
- Anchor links smooth scroll
