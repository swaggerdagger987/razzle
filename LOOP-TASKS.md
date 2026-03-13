# Razzle Ship Loop — Task Tracker

## Current State
- Phase: B (Lab Production Hardening)
- Current Task: B-2 Formula builder QA
- Current Stage: BUILD
- Tasks Completed: 1/7
- Loop Iterations: 2

## Phase A: Visual & Design Audit (Mar 12–18)
**Exit Criterion**: Open each of the three rooms plus the landing page. The visual language is unmistakably Razzle — warm sand, chunky borders, espresso ink, comic-strip energy. No page looks like it was built by a different team.

### Task 1: Design token audit
**Requirement**: "Verify every page uses correct CSS variables: --bg (#ede0cf), --ink (#2d1f14), --orange (#d97757). Hunt for hardcoded hex values, gray tones, or thin 1px borders that violate the guide."
**Accept when**: Zero hardcoded colors outside CSS variables in styles.css. All pages reference CSS variables only.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 2: Typography audit
**Requirement**: "Confirm three-font rule: Garfield/Luckiest Guy for display, Space Mono for data, Caveat only for annotations. Check font loading (preconnect, display:swap)."
**Accept when**: Every page uses correct fonts for correct purposes. Font loading optimized with preconnect and display:swap.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 3: Component consistency
**Requirement**: "Cards, buttons, chips, badges — verify 3px borders, 4px 4px 0 shadows, hover-lift behavior across all 74 pages. Spot-check 10 representative panels."
**Accept when**: Consistent chunky aesthetic across Lab panels, Bureau, Situation Room. 10 representative panels verified.
**Depends on**: 1
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 4: Situation Room dark mode
**Requirement**: "Verify agents.html uses --bg-ink (#1a110a) always-dark regardless of theme toggle. Canvas, briefing cards, config panel all dark."
**Accept when**: Situation Room is always dark, rest of site respects theme toggle.
**Depends on**: 1
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task 5: Position color consistency
**Requirement**: "QB=blue, RB=teal, WR=terracotta, TE=purple — audit Lab table, panel charts, Bureau roster views, agent briefing cards."
**Accept when**: Position colors consistent across all three rooms.
**Depends on**: 1
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 6: Loading state audit
**Requirement**: "Every async flow shows personality loading text ('pulling film...', 'checking the tape...'), not generic spinners or blank states."
**Accept when**: Zero generic "Loading..." strings remain across entire frontend.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

---

## Phase B: The Lab — Production Hardening (Mar 19–25)
**Exit Criterion**: Hand the Lab URL to a fantasy football stranger. They can explore, filter, create a formula, export an image, and share a link — all without hitting a single bug. The exported image makes them want to post it on Reddit.

### Task B-1: Core screener stress test
**Requirement**: "Load Lab with 600+ players. Sort every column. Apply 3+ filters simultaneously. Verify no JS errors, no layout breaks, pagination works."
**Accept when**: Screener handles full dataset without errors. Tag filter pagination bug fixed. Cache key optimized.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task B-2: Formula builder QA
**Requirement**: "Create formula → save → refresh → loads. Share formula URL → opens in new browser → exact same formula + sort. Delete formula → gone."
**Accept when**: Full formula CRUD lifecycle works across sessions and URLs.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task B-3: Visualization QA
**Requirement**: "Radar chart with 2-player overlay renders correctly. Scatter plot dots are clickable. Trend chart shows weekly data. No canvas rendering bugs."
**Accept when**: All chart types render correctly with real data.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task B-4: Panel audit (top 20)
**Requirement**: "Test the 20 highest-value Lab panels (dynasty rankings, trade values, breakout finder, aging curves, rookie big board, matchup heatmap, etc). Each must: load data, render correctly, handle empty states, export cleanly."
**Accept when**: Top 20 panels verified working.
**Depends on**: none
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task B-5: Export & sharing
**Requirement**: "PNG export on screener view, radar chart, scatter plot. Watermark ('razzle.lol') baked in. Clean aspect ratio. Shareable URLs resolve with og:image."
**Accept when**: Exported PNGs look screenshot-worthy with watermark.
**Depends on**: B-3
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task B-6: URL state integrity
**Requirement**: "Serialize screener state (filters, sort, columns, formula) → copy URL → paste in incognito → exact same view loads. Test 5 complex screener configs."
**Accept when**: URL state round-trips perfectly.
**Depends on**: B-1
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task B-7: Performance
**Requirement**: "Lab initial load < 2 seconds. Screener filter response < 500ms. No jank on sort/filter. Pagination smooth."
**Accept when**: Lab feels fast and responsive.
**Depends on**: B-1
**Size**: M
**Status**: PENDING
**Attempts**: 0
