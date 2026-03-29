---
id: S2-078
severity: S2
confidence: HIGH
category: a11y
source: DQ-094,DQ-064,DQ-026
status: OPEN
---

# Sitewide :focus-visible gap — 121 :hover rules vs 5 :focus-visible in lab-panels.css

## Root Cause

`frontend/lab-panels.css` has 121 `:hover` rules but only 5 `:focus-visible` rules. Keyboard users get zero visual feedback when tabbing through interactive elements. Additionally:

- `frontend/agents.html` has 3 new `outline: none` without `:focus-visible` replacement (DQ-064)
- `frontend/styles.css` — cmd-palette-item and nav-dropdown-item missing `:focus-visible` (DQ-026)

## Fix

For each `:hover` rule in lab-panels.css that applies to interactive elements (buttons, links, clickable cards), add a matching `:focus-visible` rule with a `2px solid var(--orange)` outline. Batch approach:

```css
.lp-card:hover, .lp-card:focus-visible { /* existing hover styles */ }
```

## Files (representative examples)

**lab-panels.css** — 121 `:hover` vs 5 `:focus-visible`:
- `frontend/lab-panels.css:20` — `.panel-player-link:hover` (no `:focus-visible`)
- `frontend/lab-panels.css:112` — `.lp-pos-tab:hover:not(.active)` (no `:focus-visible`)
- `frontend/lab-panels.css:161` — `.rankings-filter-btn:hover` (no `:focus-visible`)
- `frontend/lab-panels.css:224` — `.rankings-card:hover` (no `:focus-visible`)
- `frontend/lab-panels.css:310` — `.lp-view-btn:hover:not(.active)` (no `:focus-visible`)

**styles.css** — key interactive elements:
- `frontend/styles.css:607` — `.nav-dropdown-item:hover` (no `:focus-visible`)
- `frontend/styles.css:1191-1192` — `.cmd-palette-item:hover, .cmd-palette-item.active` (no `:focus-visible`)

**agents.html** — `outline: none` (these DO have `:focus-visible` replacements, OK):
- `frontend/agents.html:392,396` — `.scenario-textarea` has both (OK)
- `frontend/agents.html:1446,1450` — `.config-input` has both (OK)
- `frontend/agents.html:1525,1528` — `.config-agent-key` has both (OK)

## Acceptance Criteria

- Keyboard Tab through any lab-panels interactive element shows visible focus indicator
- No `outline: none` without `:focus-visible` replacement
