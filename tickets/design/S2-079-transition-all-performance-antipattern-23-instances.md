---
id: S2-079
severity: S2
confidence: MEDIUM
category: performance
source: DQ-062
status: OPEN
---

# `transition: all` performance anti-pattern — 23+ instances sitewide

## Root Cause

23+ instances of `transition: all` across HTML files force the browser to track ALL CSS properties for potential transitions, including layout-triggering ones like `width`, `height`, `margin`. This causes unnecessary repaints and can trigger layout thrashing.

## Fix

Replace each `transition: all` with specific properties:
```css
/* Instead of */
transition: all 0.15s ease;
/* Use */
transition: box-shadow 0.15s ease, transform 0.15s ease, background 0.15s ease;
```

## Files

- `frontend/agents.html` — multiple instances
- `frontend/aging.html` — instances
- Other standalone pages

## Acceptance Criteria

- Zero instances of `transition: all` in frontend code
- Each transition specifies only the properties that actually animate
