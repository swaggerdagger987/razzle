# Razzle Ship Loop — Task Tracker

## Current State
- Phase: D (Situation Room — Production Hardening)
- Current Task: D-2 (Agent execution QA)
- Current Stage: BUILD
- Tasks Completed: 1/8
- Loop Iterations: 4

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
**Status**: PASS
**Attempts**: 1

### Task B-3: Visualization QA
**Requirement**: "Radar chart with 2-player overlay renders correctly. Scatter plot dots are clickable. Trend chart shows weekly data. No canvas rendering bugs."
**Accept when**: All chart types render correctly with real data.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task B-4: Panel audit (top 20)
**Requirement**: "Test the 20 highest-value Lab panels (dynasty rankings, trade values, breakout finder, aging curves, rookie big board, matchup heatmap, etc). Each must: load data, render correctly, handle empty states, export cleanly."
**Accept when**: Top 20 panels verified working.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task B-5: Export & sharing
**Requirement**: "PNG export on screener view, radar chart, scatter plot. Watermark ('razzle.lol') baked in. Clean aspect ratio. Shareable URLs resolve with og:image."
**Accept when**: Exported PNGs look screenshot-worthy with watermark.
**Depends on**: B-3
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task B-6: URL state integrity
**Requirement**: "Serialize screener state (filters, sort, columns, formula) → copy URL → paste in incognito → exact same view loads. Test 5 complex screener configs."
**Accept when**: URL state round-trips perfectly.
**Depends on**: B-1
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task B-7: Performance
**Requirement**: "Lab initial load < 2 seconds. Screener filter response < 500ms. No jank on sort/filter. Pagination smooth."
**Accept when**: Lab feels fast and responsive.
**Depends on**: B-1
**Size**: M
**Status**: PASS
**Attempts**: 1

---

## Phase C: Bureau of Intelligence — Production Hardening (Mar 26–Apr 1)
**Exit Criterion**: Connect a real Sleeper account. Browse leagues, see manager profiles, find trade partners, and click through to the Situation Room — all without friction. The free tier shows enough value to hook; the gated content makes Pro feel worth it.

### Task C-1: Sleeper connection flow
**Requirement**: "Enter username → fetch leagues → display roster for each league. Test with 5+ real Sleeper usernames (different league counts, different formats). Handle: invalid username, API timeout, user with 0 leagues."
**Accept when**: Sleeper flow works for real users with proper error handling.
**Depends on**: none
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task C-2: League data rendering
**Requirement**: "Rosters, standings, transactions render correctly. Bye weeks display. Position depth visible. No stale or missing data."
**Accept when**: League data is accurate and complete.
**Depends on**: C-1
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task C-3: Manager profiling
**Requirement**: "Behavioral profiles (panic history, FAAB patterns, trade tendencies) generate correctly for multi-season leagues. Profiles render in comic-strip card style."
**Accept when**: Manager profiles render with real behavioral data.
**Depends on**: C-1
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task C-4: Trade finder QA
**Requirement**: "League-specific trade finder: value matching works, position need/surplus detection accurate, trade partner cards render with correct data."
**Accept when**: Trade suggestions are reasonable and well-presented.
**Depends on**: C-2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task C-5: Pressure map QA
**Requirement**: "Desperation scores calculate correctly. Color coding (red=desperate, green=comfortable) renders. Pro gating works (top 3 free, rest blurred)."
**Accept when**: Pressure map provides useful signal.
**Depends on**: C-2
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task C-6: Bureau → Situation Room bridge
**Requirement**: "'Ask the Diplomat' CTAs from trade finder and pressure map pre-populate scenario input in Situation Room. Cross-page handoff works via localStorage."
**Accept when**: Clicking CTA in Bureau lands in Situation Room with pre-filled scenario.
**Depends on**: C-4, C-5
**Size**: S
**Status**: PASS
**Attempts**: 1

### Task C-7: Free vs Pro gating
**Requirement**: "Free users see: leagues, rosters, basic standings, top 3 pressure entries. Pro features (full profiles, trade finder, full pressure map) show blurred preview + upgrade CTA. Gating is clear, upgrade path is obvious, no content leaks."
**Accept when**: Gating is clear, upgrade path is obvious, no content leaks.
**Depends on**: C-3, C-4, C-5
**Size**: M
**Status**: PASS
**Attempts**: 1

---

## Phase D: Situation Room — Production Hardening (Apr 2–8)
**Exit Criterion**: A paying user enters a real fantasy scenario and gets a briefing that feels like it was written by a team of analysts who know their league. The pixel agents feel alive. The experience justifies $240/year.

### Task D-1: First-run experience
**Requirement**: "New user with no API key: sees demo briefing cards, understands what the product does, knows how to configure. BYOK setup flow is clear. First-time user can go from zero to first real query in under 2 minutes."
**Accept when**: First-time user can go from zero to first real query in under 2 minutes. Setup steps are numbered and obvious.
**Depends on**: none
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task D-2: Agent execution QA
**Requirement**: "Run 10 diverse scenarios across formats (redraft start/sit, dynasty trade, keeper decision, injury impact, waiver claim). All 5 specialists + Razzle synthesis must return structured responses."
**Accept when**: 10/10 scenarios produce useful, well-structured briefings.
**Depends on**: none
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task D-3: Cross-agent triggers
**Requirement**: "Verify trigger patterns fire correctly: Medical injury → Scout handcuff check, Quant low odds → Diplomat rebuild trade, etc. Follow-up cards render with cross-reference badges."
**Accept when**: Cross-agent intelligence visibly adds value.
**Depends on**: D-2
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task D-4: Context bridge verification
**Requirement**: "Free mode: generic player data in agent context. Pro mode: league roster, scoring settings, rival rosters visible in agent responses. The difference is obvious."
**Accept when**: Pro responses clearly reference user's specific league context.
**Depends on**: D-2
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task D-5: Pixel canvas performance
**Requirement**: "Canvas renders at 60fps. 6 agents walk, work, visit stations. Activity bubbles appear. No memory leaks on long sessions. Agent selection + camera follow works."
**Accept when**: Canvas feels alive and performant.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task D-6: "What can I ask?" panel
**Requirement**: "Format-organized question reference renders. Clicking a question populates textarea. Questions cover redraft, dynasty, keeper, best ball, universal."
**Accept when**: Panel helps users understand capabilities.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0

### Task D-7: Error handling
**Requirement**: "LLM timeout (>20s) shows graceful message. Invalid API key shows clear error. Rate limit hit shows retry guidance. Network failure recovers cleanly."
**Accept when**: Every error state has a clear, helpful message.
**Depends on**: D-2
**Size**: M
**Status**: PENDING
**Attempts**: 0

### Task D-8: BYOK cloud sync
**Requirement**: "Save key to cloud (encrypted) → load on different browser → key decrypts and works. Auth + Pro tier check works."
**Accept when**: Cloud sync is reliable for paying users.
**Depends on**: none
**Size**: M
**Status**: PENDING
**Attempts**: 0
