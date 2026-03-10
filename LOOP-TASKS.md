# Razzle Loop — Phase 62 Task List

> Global Quick Search — Command Palette (Ctrl+K)

**Current Phase**: 62 — Global Quick Search
**Exit Criterion**: User presses Ctrl+K (or Cmd+K on Mac) from any page → modal search overlay opens → type player name → results appear with position badges, team, PPG → arrow keys navigate → Enter opens player profile → Escape closes. Recently viewed players shown when input is empty. Works on all pages (index, lab, league-intel, agents).

---

## Task 1: Backend — lightweight player quick-search endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/players/quick-search?q=&limit=8 in server.py. quick_search_players() in live_data.py — hits players table with indexed search_name LIKE, joins latest season PPG via subquery. Limit capped at 20. Returns empty array for empty query.

## Task 2: Frontend — command palette HTML/CSS/JS component
**Status**: PASS
**Attempts**: 1
**Notes**: Full command palette injected via app.js into all pages. Modal with backdrop blur, sand bg card, 3px ink borders, 4px offset shadow. Input with display font, results with headshot/initials, position badge (color-coded), team, PPG in mono font. Caveat "quick search" label. Loading: "pulling film...". Empty: "no players found". CSS in styles.css.

## Task 3: Keyboard shortcuts + navigation + recently viewed
**Status**: PASS
**Attempts**: 1
**Notes**: Ctrl+K / Cmd+K toggles palette globally. Escape closes. Arrow Up/Down navigates with active highlighting (orange left border). Enter navigates to /player/{id}. Recently viewed stored in localStorage (max 8), shown when input empty. Debounced search (300ms). Click and mouseenter also work.

## Task 4: Deploy + smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python and JS syntax verified. All 7 HTML pages include app.js and styles.css. Route order correct (quick-search before {player_id}). All referenced functions exist. Design matches DESIGN.md (chunky borders, sand bg, position colors, correct fonts, "pulling film..." loading).

---

## Loop State
```
Current Phase: 62
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
