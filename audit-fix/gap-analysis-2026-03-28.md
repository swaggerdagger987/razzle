# Audit Gap Analysis — 2026-03-28

## Scope

Cross-referenced ALL audit sources against ALL existing tickets (170+) to find un-decomposed findings.

## Sources Analyzed

| Source | Findings | Coverage |
|--------|----------|----------|
| EDGE-CASES.md | 74 items | 74/74 tracked in triage-results.tsv |
| DESIGN-QA-TICKETS.md | 10 DES findings | 10/10 mapped to S2/S3 tickets |
| DESIGN-TICKETS.md | 10 findings | 10/10 mapped to S2/S3 tickets |
| QA-AUDIT.md | 6 findings | All fixed in Phase 130 |
| BUGS.md | 6 open bugs | 6/6 mapped to S3-086 through S3-090 |
| docs/reviews/ (6 files) | ~50 findings | All fixed or ticketed |
| designer-tickets/ (30 files) | 116 DQ entries | All mapped to S tickets |
| functional-qa/ (78 flows) | 70+ FUNC tickets | All PASS or FIXED |
| TICKETS.md P0 phases | 3 meta-tasks | Decomposed into S0-008, S1-022, S1-023 |
| BUGFIX-TRACKER.md | Index only | No net-new findings |

## Verification Method

For every gap candidate, I investigated the actual code at the reported file:line to check whether it was:
1. **Fixed** by the ship loop since the audit was written
2. **Already ticketed** under a different name/batch
3. **Genuinely missing** (needs a new ticket)

## Findings Fixed Since Audit (Verified in Code)

These were reported as bugs but are now fixed in the current codebase:

| EDGE-CASES # | Finding | Evidence of Fix |
|---|---|---|
| 4 | Welcome modal `/agents` 404 | app.js:1402 now uses `/agents.html` |
| 5 | Sign In button wrong element ID | All buttons use `openAuthModal()` function |
| 15 | Rate limiters use proxy IP | server.py:70-78 uses X-Forwarded-For |
| 16 | getAuthToken() wrong location | warroom.js:1598 reads `razzle_token` |
| 18 | /api/analytics/summary unauth | server.py:2794 checks x-admin-secret |
| 19 | LIKE injection in 4 endpoints | All queries use `ESCAPE '\\'` clause |
| 26 | Warroom animation loop never stops | warroom.js:1434+1453 visibility+beforeunload cleanup |
| 33 | _cache_locks grows unboundedly | core.py:86-88 cleans stale locks |
| 35 | html2canvas synchronous on 51 pages | Now lazy-loaded via app.js:488-500 |
| 50 | Gradient in lab.js data bars | No linear-gradient found in lab.js |
| 71 | SQLite WAL/SHM not gitignored | .gitignore has `*.db-shm` and `*.db-wal` |
| 73 | terminal_clean.db 490MB orphan | File no longer exists |

| Launch Review | Finding | Evidence of Fix |
|---|---|---|
| P0-1 | Backend _get_client_ip() recursion | server.py:78 returns `request.client.host` |
| P0-2 | Bureau page right-aligned | league-intel.html:31 `margin: 0 auto` |
| P0-3 | agents.html 50+ unclosed divs | 149 opening = 149 closing divs |
| Canvas fonts | 4 pages use `24px sans-serif` | No matches found |

| Design | Finding | Evidence of Fix |
|---|---|---|
| DQ-027 | SVG system-ui font | No matches in assets/ |

## JWT Plan Caching Concern — Not a Bug

The launch review flagged JWT plan caching as a security issue. Investigation shows `get_current_user()` at auth.py:372-385 does a FRESH DB lookup on every API call (`SELECT * FROM users WHERE id = ?`). The plan in `require_plan()` is always current from the database, not stale from the JWT.

## Agent Presence Status

The TICKETS.md P0 "Agent Presence Invisible" concern was verified:

| Feature | Status | Evidence |
|---|---|---|
| Agent-voiced loading states | IMPLEMENTED | app.js:482 calls getLoadingText() from agent-config.js |
| Agent-voiced empty states | IMPLEMENTED | app.js razzleEmpty() wired to agent-config |
| Agent-voiced error states | IMPLEMENTED | app.js razzleError() wired to agent-config |
| Ambient character peek | IMPLEMENTED | app.js:1990-2018 creates agent-peek div |
| Rarity watermarks | IMPLEMENTED | app.js:531-546 drawRazzleWatermark() picks random agent |
| 404 personality | IMPLEMENTED | 404.html:154 "gone scouting the waiver wire..." |
| Bureau agent-config | IMPLEMENTED | league-intel.html:2678 loads agent-config.js |
| Column tooltips | NOT IMPLEMENTED | Ticketed as S1-022 |
| Panel subtitle attribution | NOT IMPLEMENTED | Ticketed as S1-023 |

## Result

**All audit findings are either fixed or already decomposed into tickets.**

- 287 triage entries across 24 invocations cover all findings
- 170+ tickets in tickets/ directory (S0 through S3, CEO, QA)
- 0 net-new tickets required

## Ticket Count Summary

| Severity | Count | Status |
|---|---|---|
| S0 | 8 | All OPEN |
| S1 | 32 | All OPEN |
| S2 | 99 | All OPEN |
| S3 | 89 | All OPEN |
| CEO | 18 | All OPEN |
| QA | 1 | All OPEN |
| **Total** | **247** | |
