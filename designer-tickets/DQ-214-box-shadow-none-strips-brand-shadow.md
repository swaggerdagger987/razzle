# DQ-214: box-shadow:none strips chunky brand shadow in 6 places

**Priority**: P2
**Category**: Brand consistency
**Page**: Lab, Cheat Sheet, sitewide

## What's wrong

Six CSS rules set `box-shadow: none`, completely removing the chunky offset shadow that IS the Razzle visual identity. Shadows are removed for active states, closed sidebars, mobile views, and a delete button. The chunky shadow is the brand's tactile signature — removing it entirely makes elements look flat and un-Razzle.

## Where

- `lab.html:479` — `.btn-panel-action:active { box-shadow: none; }`
- `lab.html:592` — `.lab-sidebar.closed { box-shadow: none; }`
- `lab.html:2699` — mobile breakpoint: `box-shadow: none;`
- `lab.html:2724` — mobile breakpoint: `box-shadow: none !important;`
- `styles.css:636` — `.btn-delete { box-shadow: none !important; }`
- `cheatsheet.html:223` — `.cs-col { box-shadow: none; }`

## Fix

- Active states: use `box-shadow: 2px 2px 0 var(--ink)` (pressed, not removed)
- Closed sidebar: keep a subtle `2px 2px 0 var(--ink-faint)` or remove entirely if hidden
- Mobile: reduce to `2px 2px 0 var(--ink)` instead of removing
- Delete button: use `2px 2px 0 var(--red)` to maintain chunky feel with danger color
- Cheat sheet columns: use `2px 2px 0 var(--ink)` for subtle depth

## Not a dupe of

- DQ-022 (overflow-hidden clips box-shadows) — that's about clipping, not intentional removal
