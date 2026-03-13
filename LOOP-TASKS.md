# Razzle Ship Loop — Task Tracker

## Current State
- Phase: A (Visual & Design Audit)
- Current Task: 2
- Current Stage: PENDING
- Tasks Completed: 1/6
- Loop Iterations: 1

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
**Status**: PENDING
**Attempts**: 0

### Task 3: Component consistency
**Requirement**: "Cards, buttons, chips, badges — verify 3px borders, 4px 4px 0 shadows, hover-lift behavior across all 74 pages. Spot-check 10 representative panels."
**Accept when**: Consistent chunky aesthetic across Lab panels, Bureau, Situation Room. 10 representative panels verified.
**Depends on**: 1
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 4: Situation Room dark mode
**Requirement**: "Verify agents.html uses --bg-ink (#1a110a) always-dark regardless of theme toggle. Canvas, briefing cards, config panel all dark."
**Accept when**: Situation Room is always dark, rest of site respects theme toggle.
**Depends on**: 1
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task 5: Position color consistency
**Requirement**: "QB=blue, RB=teal, WR=terracotta, TE=purple — audit Lab table, panel charts, Bureau roster views, agent briefing cards."
**Accept when**: Position colors consistent across all three rooms.
**Depends on**: 1
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task 6: Loading state audit
**Requirement**: "Every async flow shows personality loading text ('pulling film...', 'checking the tape...'), not generic spinners or blank states."
**Accept when**: Zero generic "Loading..." strings remain across entire frontend.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
