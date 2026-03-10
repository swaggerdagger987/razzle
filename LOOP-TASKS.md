# Razzle Loop — Phase 47 Task List

> Auto-generated. Home page needs live data to convert Reddit visitors into Lab users.

**Current Phase**: 47 — Home Page Live Data Widgets — Featured Analysis Cards
**Exit Criterion**: Home page shows 3 live data widgets pulling real stats from the API: "Dynasty Risers" (top 5 PPG/age value), "Rookie Big Board" (top 5 prospects), "Breakout Candidates" (high target share + low PPG). Each card shows player names, key stats, position badges. Each links to the Lab with pre-applied filters. Styled in comic-strip design. Mobile responsive. Deployed to Render.

---

## Task 1: Backend — featured analysis API endpoint
**Status**: PASS
**Acceptance Criteria**:
- GET /api/featured returns 3 curated lists: dynasty_risers, rookie_board, breakout_candidates
- dynasty_risers: top 5 players by PPG/age ratio (young + productive)
- rookie_board: top 5 prospects by prospect score from Big Board data
- breakout_candidates: players with high target share but below-average PPG (breakout upside)
- Returns player name, position, team, 2-3 key stats per list
- Fast query (< 200ms)

## Task 2: Frontend — featured analysis cards on home page
**Status**: PASS
**Acceptance Criteria**:
- 3 cards below the hero section: Dynasty Risers, Rookie Big Board, Breakout Candidates
- Each card shows 5 players with position badge, name, team, and 2 key stats
- Chunky border card design per DESIGN.md (3px border, 4px shadow, sand bg)
- Slightly rotated card titles (sticker aesthetic)
- "Open in Lab" button links to Lab with pre-applied filters/sort
- Cards fetch data on page load from /api/featured

## Task 3: Mobile responsive + animation
**Status**: PASS
**Acceptance Criteria**:
- Cards stack vertically on mobile (< 768px)
- Smooth fade-in animation on load
- Loading state: "pulling film..." while fetching
- Error state: "couldn't load the latest intel" with retry button

## Task 4: Deploy + smoke test
**Status**: PASS
**Acceptance Criteria**:
- All JS files pass syntax check
- All Python files import cleanly
- Featured endpoint returns valid data
- Cards render on home page with real player data
- Lab links work with correct pre-applied filters
- Committed and pushed to master

---

## Loop State
```
Current Phase: 47
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
