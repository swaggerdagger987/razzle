# Platform Loop — Phase 138 Task List

## Status
Current Phase: 138 (Bureau Activity Feed + Formula Cloud Sync)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 4/4
Loop Iterations: 4

---

## Task 1: Bureau Competitor Activity Feed
**Requirement**: "Live view of what competitors are doing — waiver claims, trades, roster moves." (North Star, Bureau of Intelligence Free tier)
**Accept when**: When a league is expanded on league-intel.html, a "recent activity" section appears showing the last 25 transactions across the league. Each transaction shows: manager name, type (trade/waiver/free_agent), players added/dropped, FAAB bid amount (if waiver), and relative timestamp ("2 days ago"). Trades show both sides. The feed auto-loads when the league expands. Styled in Razzle design system with position-colored player names.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: Formula Cloud Sync — Backend Endpoints
**Requirement**: "Cloud sync (formulas, watchlists, saved views)" (Roadmap Phase 9, Pricing Strategy Pro+ feature)
**Accept when**: Two new API endpoints exist: `POST /api/formulas/sync` (upload all user formulas from localStorage to server) and `GET /api/formulas/mine` (retrieve all user's formulas from server). Both require auth. Formulas stored in users.db with user_id foreign key. Sync is idempotent — re-uploading the same formulas doesn't create duplicates. Response includes formula count and last sync timestamp.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS (already existed: GET/POST /api/user/formulas, POST /api/user/formulas/import)

## Task 3: Formula Cloud Sync — Frontend Integration
**Requirement**: "Saved formulas, saved views, agent history — all tied to account." (North Star, Retention)
**Accept when**: On Lab page, when a Pro/Elite user is logged in, formulas auto-sync to server on save. On page load, if logged in as Pro+, formulas are fetched from server and merged with localStorage (server wins on conflict by name). A small "cloud-synced" badge appears next to the formula count. Free users see "upgrade to sync formulas across devices" hint in formula builder. Sync happens silently without blocking the UI.
**Depends on**: Task 2
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 4: Activity Feed Context Bridge — Feed Bureau Data into Agent Prompts
**Requirement**: "Context bridge: Lab + Bureau data feeds into agent prompts" (Roadmap Phase 8)
**Accept when**: When a Sleeper-connected paid user runs agents, the prompt includes a "RECENT LEAGUE ACTIVITY" section with the last 10 transactions (same data as the activity feed). The Diplomat agent specifically references recent trades. The Scout agent references recent waiver pickups. This data is saved to razzle_league_context in localStorage when the activity feed loads on league-intel.html.
**Depends on**: Task 1
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS
