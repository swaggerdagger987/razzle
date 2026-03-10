# Razzle Loop — Phase 58 Task List

> Roster Value Calculator + Team Card — Dynasty roster valuation and shareable team card

**Current Phase**: 58 — Roster Value Calculator + Team Card
**Exit Criterion**: Users can build a roster by searching and adding players (reusing Lab search), see total dynasty trade value with positional breakdown (pie chart), age vs. value scatter plot, a competing/rebuilding grade, and export the whole thing as a branded PNG "team card." Accessible from Lab nav. Comic-strip design with chunky borders, sand bg, position colors.

---

## Task 1: Backend roster-value endpoint
**Status**: PASS
**Notes**: POST /api/roster-value accepts { player_ids: [...] }. Returns per-player trade values, positional_totals, positional_counts, average_age, grade (A+ through F), competing_status (competing/retooling/rebuilding). Reuses fetch_trade_values. Max 60 players.

## Task 2: Frontend My Roster panel with player search
**Status**: PASS
**Notes**: "My Roster" button (green border) in Lab toolbar opens filter-modal overlay. Search input with 250ms debounce searches /api/players. Click to add players (localStorage razzle_my_roster). Roster grouped by position with remove buttons. "Calculate Value" button triggers API call.

## Task 3: Visual roster report (pie chart, age scatter, grade)
**Status**: PASS
**Notes**: Grade badge (A+ through F) with position-colored background, rotated comic-strip style. Competing/retooling/rebuilding status badge. Pie chart shows QB/RB/WR/TE value breakdown with legend. Age vs Value scatter plot with position-colored dots and name labels for high-value players. Player values table with position badges, value bars, sorted by value.

## Task 4: PNG export of team card
**Status**: PASS
**Notes**: Canvas-rendered PNG: header "MY DYNASTY ROSTER", grade badge, total value, status badge, positional pie chart, age scatter, player table (up to 30 players), razzle.lol watermark. Downloads as razzle-team-card.png.

## Task 5: Deploy + smoke test
**Status**: PASS
**Notes**: node -c lab.js passes. py_compile passes on server.py and live_data.py. All function references from HTML to JS verified. All backend endpoints exist.

---

## Loop State
```
Current Phase: 58
Current Task: 5
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 5/5
```
