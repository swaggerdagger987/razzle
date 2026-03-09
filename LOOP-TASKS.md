# Razzle Loop — Phase 40 Task List

> Consumed from TICKETS.md (Ticket 2).

**Current Phase**: 40 — Stats Expansion — Computed Columns
**Exit Criterion**: 13 new computed stat columns available in the Lab screener, all derived from existing database fields with no adapter changes. Passer rating, AY/A, TD rate, fumble rate, rush share, dominator rating, red zone share, YPRR approximation, points per first down scoring, superflex PPR scoring, and custom scoring builder functional. Deployed to Render.

---

## Task 1: Add passer rating + AY/A + TD rate + fumble rate
**Status**: PASS
**Result**: Added 4 computed columns to _enrich_with_derived_stats() in live_data.py: passer_rating (NFL formula with clamped components), ay_per_att (adjusted yards per attempt), td_rate (TDs/(carries+targets)%), fumble_rate (fumbles_lost/(carries+receptions)%). Added to COLUMNS in lab.js with tooltips. Added to passing and efficiency presets. All computed in Python post-processing, not SQL.

## Task 2: Add dominator rating + rush share + red zone share
**Status**: PASS
**Result**: Added _enrich_with_team_shares() function that queries team totals from player_week_stats. Dominator rating = (rec_yds + rec_tds*20) / (team_rec_yds + team_rec_tds*20) for WR/TE only. Rush share = player carries / team carries for RB/QB only. Red zone share SKIPPED — no rz columns exist in database (would require play-by-play extraction from Ticket 3). Both enrichment chains updated (fetch_players + fetch_screener). Columns added to COLUMNS with tooltips, dynasty preset includes DOM.

## Task 3: Add YPRR approximation + WOPR per game
**Status**: PENDING
**Acceptance Criteria**:
- YPRR* column in Efficiency with tooltip
- Values 2.0-3.0 for elite WRs, 1.2-1.8 average
- WOPR/G in Per Game category
- '—' for non-applicable positions

## Task 4: Add Half-PPR + Points Per First Down + Superflex tooltip
**Status**: PENDING
**Acceptance Criteria**:
- Half-PPR and Half-PPR/G columns in Fantasy
- PPFD and PPFD/G in Fantasy (if first_downs data exists)
- PPR tooltip mentions superflex relevance
- Values reasonable

## Task 5: Add custom scoring builder
**Status**: PENDING
**Acceptance Criteria**:
- Custom Scoring button in Lab toolbar opens modal
- Default PPR weights pre-filled, user adjustable
- Saving adds computed column to table
- Config saved to localStorage, persists
- Up to 3 named configs
- Modal follows Razzle design system

## Task 6: Deploy + smoke test computed columns
**Status**: PENDING
**Acceptance Criteria**:
- All JS passes syntax check
- All Python imports clean
- Passer rating values reasonable
- Dominator rating shows for WRs, '—' for QBs
- Custom scoring builder saves and computes
- All new columns sortable
- Committed and pushed to master

---

## Loop State
```
Current Phase: 40
Current Task: 3
Current Stage: BUILD
Attempt: 1
Tasks Completed: 2/6
```
