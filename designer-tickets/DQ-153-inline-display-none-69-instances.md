---
id: DQ-153
priority: P3
area: css-architecture
section: maintainability
type: tech-debt
status: open
---

# 69 inline style="display:none" should use CSS .hidden class

## What's wrong

69 HTML elements use `style="display:none"` as inline styles for show/hide toggling. This bypasses the CSS system and makes it impossible to style hidden elements differently in dark mode, print, or responsive contexts. A single `.hidden { display: none; }` utility class in styles.css would replace all of them.

## Where

Worst offenders by file:
- `frontend/lab.html` — 24 instances (modals, panels, overlays)
- `frontend/agents.html` — 10 instances (config panels, status elements)
- `frontend/league-intel.html` — 6 instances (tabs, panels)
- `frontend/pricing.html` — 3 instances
- `frontend/breakdown.html` — 3 instances
- `frontend/cheatsheet.html` — 2 instances
- Plus 21 more across other HTML files

## Fix

1. Add `.hidden { display: none; }` to styles.css (if not already present)
2. Replace `style="display:none"` with `class="hidden"` in all 69 instances
3. In JS, toggle with `el.classList.add('hidden')` / `el.classList.remove('hidden')` instead of `el.style.display = 'none'` / `el.style.display = ''`

## Why it matters

Inline styles have highest specificity. If the JS toggle sets `el.style.display = 'block'`, a media query can never override it. The .hidden class approach lets responsive CSS still work.
