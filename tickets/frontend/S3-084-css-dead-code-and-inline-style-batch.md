---
id: S3-084
severity: S3
confidence: MEDIUM
category: code-quality
source: DQ-219+280+276+313+301+304+163
status: OPEN
---

# CSS dead code and inline style governance batch

## Root Cause

Multiple CSS code quality issues:

1. **btn-outline class no CSS definition** — `frontend/`: `btn-outline` class referenced but never defined in any stylesheet (DQ-219)
2. **Agents pricing cards massive inline styles** — `frontend/agents.html`: pricing card elements have 20+ inline style properties that should be CSS classes (DQ-280)
3. **Pricing free celebration inline styles** — `frontend/pricing.html`: celebration animation uses massive inline style blocks (DQ-276)
4. **Dashboard season select all inline** — `frontend/dashboard.html`: select element styling entirely inline (DQ-313)
5. **Lab toolbar button border inline** — `frontend/lab.html`: toolbar button border color set via inline style (DQ-301)
6. **Lab sidebar icon inline styles** — `frontend/lab.html`: sidebar icons styled inline instead of CSS class (DQ-304)
7. **Home elite/pro CTA inline style** — `frontend/index.html`: CTA buttons use inline styles for layout (DQ-163)

## Fix

- Remove undefined `btn-outline` class or define it
- Extract inline styles to CSS classes
- Use existing design system classes where possible

## Files

- `frontend/agents.html` — pricing card inline styles
- `frontend/pricing.html` — celebration inline styles
- `frontend/dashboard.html` — select inline styles
- `frontend/lab.html` — toolbar and sidebar inline styles
- `frontend/index.html` — CTA inline styles

## Acceptance Criteria

- No CSS classes referenced without definitions
- Inline styles extracted to CSS where possible
- Dark mode and responsive overrides work on extracted styles
