---
id: S3-092
severity: S3
confidence: MEDIUM
category: a11y
source: DQ-261+302+185+184+109
status: OPEN
---

# Accessibility batch — motion, emoji announcement, auth modal, nav state

## Root Cause

Remaining accessibility items not covered by other tickets:

1. **Welcome modal confetti no reduced-motion** — `frontend/app.js`: confetti animation on trial start ignores `prefers-reduced-motion` preference (DQ-261). Related to S3-057 but specific to the welcome modal confetti.

2. **Badge emojis double-announced** — `frontend/agents.html`: agent badges with emoji + text cause screen readers to announce emoji name AND text (e.g., "shield emoji Security Engineer") (DQ-302). Fix with `aria-hidden="true"` on emoji spans.

3. **Hover lift ignores reduced-motion** — `frontend/styles.css`: hover translate/shadow transitions run even with reduced-motion preference active (DQ-185). The existing reduced-motion media query disables some transitions but not hover lifts.

4. **Nav active missing aria-current** — sitewide: active nav link uses CSS class but lacks `aria-current="page"` attribute for screen readers (DQ-184)

5. **Auth modal no privacy/terms link** — `frontend/app.js`: registration form has no link to privacy policy or terms of service (DQ-231). Accessibility and legal requirement.

## Fix

- Add `prefers-reduced-motion` check before confetti
- Add `aria-hidden="true"` to decorative emoji spans
- Extend reduced-motion media query to cover hover lift
- Add `aria-current="page"` to active nav links
- Add privacy/terms link to registration form

## Files

- `frontend/app.js` — confetti, nav, auth modal
- `frontend/agents.html` — emoji badges
- `frontend/styles.css` — reduced-motion, hover lift

## Acceptance Criteria

- No animation plays when reduced-motion preferred
- Screen readers don't double-announce emoji badges
- Active nav link announced by screen readers
- Registration form includes privacy/terms link
