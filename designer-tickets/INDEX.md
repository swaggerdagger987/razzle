# Design QA Tickets — Batch 2026-03-23

50 tickets from design audit against DESIGN.md. Cycles 1-3: code-based token audit. Cycle 4: sitewide pattern audit. Cycles 5-6: visual QA with screenshots. Cycle 7: UX/conversion/readability audit (15 pages, light+dark, desktop+mobile, 3 subagent verifications).

## P1 — High Impact (visible on every page)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-001 | Dark mode --ink-light wrong hex (#a89888 vs #8a7565) | styles.css:80 |
| DQ-002 | btn-chunky/btn-primary box-shadow 2px instead of 4px | styles.css:761,789 |
| DQ-003 | Hover lift missing translate(-2px,-2px) on buttons | styles.css:766,794,1053 |
| DQ-011 | Sitewide box-shadow undersized (2px/3px instead of 4px) | 22 HTML files, 72 instances |
| DQ-015 | Tiers page cream text hardcoded rgba, poor contrast | tiers.html:144,217 |
| DQ-021 | Canvas `bold` on single-weight Luckiest Guy (47 instances) | lab.js, charts.js, compare.js, player.js |
| DQ-022 | overflow:hidden clips 4px box-shadows on 8 cards | lab-panels.css (8 classes) |
| DQ-023 | Dark mode overlays still use cold black rgba(0,0,0) | lab.html, player.js |
| DQ-024 | Correlation heatmap canvas hardcodes #fff text | lab-panels.js:9821,10118 |
| DQ-031 | Agents page hero+footer on light sand (should be all dark) | agents.html |
| DQ-032 | Agent names don't match DESIGN.md (Bones/Octo/Atlas) | agents.html:1619-1624 |
| DQ-041 | Pricing dark mode — comparison table text barely readable | pricing.html:169-183 |
| DQ-042 | Pro gate — 48+ panels identical generic lock, no teaser | lab.html (switchPanel) |

## P2 — Medium Impact (visible in specific views)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-004 | 15x border-bottom:1px in JS tables (should be 2px dashed) | charts.js, lab.js, formulas.js, player.js, lab-panels.js |
| DQ-005 | Noscript blocks hardcode colors + fonts | lab.html, league-intel.html, agents.html |
| DQ-006 | border-radius 3px/4px/6px not in token set | warroom.js, lab-panels.js, lab.js |
| DQ-007 | charts.js position color map hardcoded 3x | charts.js:341,672,1021 |
| DQ-008 | charts.js accent colors hardcoded (no dark mode) | charts.js:3-561 |
| DQ-012 | Off-token border-radius 14px (should be 12px) | archetypes.html, dashboard.html, lab-panels.css, tiers.html |
| DQ-013 | Off-token border-radius 6px (should be 8px) | lab.html:2246,2493 |
| DQ-014 | Hover shadow wrong size (5px/3px instead of 6px/4px) | lab.html:2147,475 |
| DQ-017 | Sort column bg hardcoded terracotta rgba | lab.html:1063-1068 |
| DQ-018 | Cold black rgba(0,0,0,...) shadows (should be warm brown) | agents.html:39,259,285 |
| DQ-020 | Dashboard/tiers hover + text-shadow no dark mode override | dashboard.html:145, tiers.html:139 |
| DQ-025 | 6 remaining off-token border-radius in lab-panels.css | lab-panels.css (6 values) |
| DQ-026 | cmd-palette-item + nav-dropdown-item missing :focus-visible | styles.css |
| DQ-028 | 4 interactive elements missing :active press state | agents.html, lab.html, lab-panels.css, styles.css |
| DQ-029 | Z-index hierarchy undocumented (9999, 10000, 1000) | styles.css |
| DQ-033 | Tiers tier-letter badges have NO rotation (should be 3deg) | tiers.html:125-146 |
| DQ-035 | Tiers/Rankings no dark mode overrides for tier colors | tiers.html, rankings.html |
| DQ-037 | Standalone redirect pages show flash of Pro gate content | stocks.html, reportcard.html, etc. |
| DQ-039 | Lab mobile toolbar cramped touch targets (<44px) | lab.html |
| DQ-040 | Standalone page cards hover shadow stays 4px (should grow to 6px) | breakouts.html, dashboard.html, tiers.html |
| DQ-043 | Compare page empty state — no illustration or example | compare.html, compare.js |
| DQ-044 | Rankings player names truncated in cards (~140px) | rankings.html:201-209 |
| DQ-045 | Tiers chip density too cramped (~6px gap, needs 10-12px) | tiers.html |
| DQ-046 | Home Situation Room demo is tiny static card, not visual | index.html |
| DQ-047 | Breakouts page — all cards identical weight, no hierarchy | breakouts.html |
| DQ-048 | Bureau pre-connect — generic form, no feature preview | league-intel.html |
| DQ-050 | Pricing mobile — comparison table cramped at 375px | pricing.html |

## P3 — Low Impact (polish)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-009 | Razzle mascot image empty alt text | agents.html:1633 |
| DQ-010 | Pixel engine uses 20+ cold gray hex values | warroom.js:418-651 |
| DQ-016 | Hero mascot drop-shadow hardcoded, invisible in dark mode | index.html:77 |
| DQ-019 | Konami confetti hardcoded position color hex values | app.js:1741 |
| DQ-027 | SVG research-sprawl.svg uses system-ui font fallback | assets/research-sprawl.svg |
| DQ-030 | Transition timing inconsistent (0.1s vs 0.12s standard) | styles.css, agents.html, lab.html |
| DQ-034 | Rankings tier badges wrong rotation angle (-2deg vs 3deg) | rankings.html:117 |
| DQ-036 | Dashboard hover hardcoded rgba(217,119,87,0.05) | dashboard.html:145 |
| DQ-038 | Pro teaser uses custom .btn-pro-upgrade instead of .btn-primary | agents.html, warroom.js |
| DQ-049 | Pricing dark mode — feature pills harsh teal borders | pricing.html |
