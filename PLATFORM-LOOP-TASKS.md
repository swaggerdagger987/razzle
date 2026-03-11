# Platform Loop — Phase 141 Task List

## Status
Current Phase: 141 (Watchlist Cloud Sync + Formula Store Gating + Server-Side Query Limits)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 5/5
Loop Iterations: 5

---

## Task 1: Watchlist Cloud Sync — Backend
**Requirement**: "Watchlist: YES (localStorage) for Free, YES (cloud sync) for Pro/Elite" — Pricing Strategy Feature Matrix
**Accept when**: Backend has `GET /api/user/watchlist` and `POST /api/user/watchlist/sync` endpoints. Both require auth + Pro+ plan. Sync replaces all watchlist items for user, caps at 200 players. get_watchlist and sync_watchlist functions in auth.py using context managers.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 2: Watchlist Cloud Sync — Frontend
**Requirement**: "Watchlist: YES (cloud sync) for Pro/Elite" — Pricing Strategy Feature Matrix
**Accept when**: On Lab page load, Pro/Elite users get watchlist synced from server (merge: union of server + local, server wins on conflict). saveWatchlist() pushes to server in background. Cloud-synced badge shown for paid users, upgrade hint for free. Matches formula sync pattern.
**Depends on**: Task 1
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Formula Store Tier Gating
**Requirement**: "Formula Store (browse): Preview only for Free, FULL ACCESS for Pro/Elite. Formula Store (publish): NO for Free, YES for Pro/Elite. Formula Store (rate/review): NO for Free, YES for Pro/Elite." — Pricing Strategy Feature Matrix
**Accept when**: Free users see formula cards with blurred descriptions and a "Unlock with Pro" overlay on Import button. Rating stars and review input hidden for free users. Publish button requires Pro+. Pro/Elite users get full access. The upgrade CTA feels like an invitation, not a wall.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 4: Server-Side AI Query Rate Limiting
**Requirement**: "Generic AI queries (no league context): 5/day Free, 20/day Pro, Unlimited Elite" — Pricing Strategy Feature Matrix. Currently only client-side (localStorage) — trivially bypassed.
**Accept when**: Backend tracks queries per user per day in users.db. Free=5/day, Pro=20/day, Elite=unlimited. Returns 429 with remaining quota info when limit hit. Client syncs with server. Unauthenticated users get 5/day by IP.
**Depends on**: none
**Size**: M
**Primary role**: BACKEND
**Status**: PASS

## Task 5: Compare Mode Tier Gating
**Requirement**: "Compare mode (head-to-head): 2 players Free, 4 players Pro/Elite" — Pricing Strategy Feature Matrix
**Accept when**: Lab compare mode limits free users to 2 player selections. Attempting to select 3+ shows upgrade nudge. Pro/Elite can select up to 4.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS
