# Design QA Tickets — Batch 2026-03-23

10 tickets from code-based design audit against DESIGN.md.

## P1 — High Impact (visible on every page)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-001 | Dark mode --ink-light wrong hex (#a89888 vs #8a7565) | styles.css:80 |
| DQ-002 | btn-chunky/btn-primary box-shadow 2px instead of 4px | styles.css:761,789 |
| DQ-003 | Hover lift missing translate(-2px,-2px) on buttons | styles.css:766,794,1053 |

## P2 — Medium Impact (visible in specific views)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-004 | 15x border-bottom:1px in JS tables (should be 2px dashed) | charts.js, lab.js, formulas.js, player.js, lab-panels.js |
| DQ-005 | Noscript blocks hardcode colors + fonts | lab.html, league-intel.html, agents.html |
| DQ-006 | border-radius 3px/4px/6px not in token set | warroom.js, lab-panels.js, lab.js |
| DQ-007 | charts.js position color map hardcoded 3x | charts.js:341,672,1021 |
| DQ-008 | charts.js accent colors hardcoded (no dark mode) | charts.js:3-561 |

## P3 — Low Impact (polish)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-009 | Razzle mascot image empty alt text | agents.html:1633 |
| DQ-010 | Pixel engine uses 20+ cold gray hex values | warroom.js:418-651 |
