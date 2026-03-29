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

## Files (representative examples)

**styles.css** (5 instances):
- `frontend/styles.css:218` — `transition: all 0.15s;` (nav links)
- `frontend/styles.css:448` — `transition: all 0.12s;` (mobile nav)
- `frontend/styles.css:549` — `transition: all 0.12s;` (nav user)
- `frontend/styles.css:703` — `transition: all 0.15s;` (auth modal)
- `frontend/styles.css:764` — `transition: all 0.12s;` (btn-chunky)

**agents.html** (5 instances):
- `frontend/agents.html:78,105,182,477,524`

**aging.html** (3 instances):
- `frontend/aging.html:76,120,177`

**lab-panels.css** (~15 instances)

## Acceptance Criteria

- Zero instances of `transition: all` in frontend code
- Each transition specifies only the properties that actually animate
