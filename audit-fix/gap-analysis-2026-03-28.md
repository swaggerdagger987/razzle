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

- 288 triage entries across 26 invocations cover all findings
- 248 tickets in tickets/ directory (S0 through S3, CEO, QA)
- 1 net-new ticket added from functional QA cross-reference (2026-03-28)

## Functional QA Cross-Reference (2026-03-28 Session 26)

Cross-referenced 15 open FUNC findings against existing tickets. Investigated each at file:line level:

| Finding | Code Status | Action |
|---|---|---|
| FUNC-001: seasonSelect null crash | **OPEN** — no guard at lab.js:3039 | **NEW TICKET: S1-041** |
| FUNC-012 L2: season_type filters | FIXED — all 11 query functions have filters | No ticket needed |
| FUNC-017: breakout badge PPG | FIXED — c3f39be9 uses PPG + 10-game mins | No ticket needed |
| FUNC-016: escapeAttr in onclick | FIXED — switched to data-attr + listeners | No ticket needed |
| FUNC-025: safe_sorts whitelist | FIXED — all 4 columns present | No ticket needed |
| FUNC-028: QB PPO cascade | Code correct — uses attempts+carries for QBs | No ticket needed |
| FUNC-029: snap_share thresholds | NOT A BUG — thresholds already percentage | No ticket needed |
| FUNC-035: QB efficiency | Code fixed — uses pass_attempts; data fix via S1-033 | No ticket needed |
| FUNC-039: nudgeFadeIn keyframes | FIXED — defined in CSS + runtime injection | No ticket needed |
| FUNC-042: over-fetch cap 500 | NOT A BUG — LIMIT 5000 in career mode | No ticket needed |
| FUNC-052: TD Regression fields | FIXED — field names match | No ticket needed |
| IEEE 754 artifacts | FIXED — all ROUND() calls in place | No ticket needed |
| Pin player vanish | FIXED — _pinnedDataCache fallback | No ticket needed |

## Ticket Count Summary (Final — Invocation 30)

| Severity | Count | Status |
|---|---|---|
| S0 | 8 | All OPEN |
| S1 | 41 | All OPEN |
| S2 | 124 | All OPEN |
| S3 | 111 | All OPEN |
| CEO | 18 | All OPEN |
| QA | 1 | All OPEN |
| **Total** | **303** | |

TSV entries: 465 (285 OPEN, 101 COVERED, 48 STALE, 22 SKIP, 9 other)

## TSV Backfill — Invocation 30 (2026-03-28)

41 ticket files existed but were not tracked in triage-results.tsv. These were created by parallel triage sessions (CEO reviews, designer audits, functional QA) that wrote tickets directly without logging to the TSV. All 41 entries backfilled with invocation=30.

Includes: S1-032 through S1-040, S2-098 through S2-116, S2-124, S3-093 through S3-103, S3-111.

18 CEO tickets (tickets/ceo/) are tracked as ticket files but not in the TSV — these originate from a separate CEO review process.

## DQ Designer-Ticket Coverage Verification (2026-03-28 Session 27)

Cross-referenced all 450 DQ designer-ticket files against existing S-tickets:

| Status | Count | Method |
|---|---|---|
| Explicitly referenced by DQ number in ticket files | 394 | grep DQ-nnn in tickets/ |
| Tracked in triage-results.tsv (SKIP/STALE/DUPLICATE) | 233 | TSV finding_ref column |
| Remaining 67 verified COVERED by broader ticket scope | 67 | Manual filename-to-scope mapping |
| **Total DQ entries accounted for** | **450/450** | |

All 67 remaining DQ entries were mapped to existing tickets whose scope descriptions cover the finding. No new tickets needed. Entries appended to triage-results.tsv as COVERED with ticket references.

## DEEP-AUDIT-TICKETS.md + STAT-AUDIT-REPORT.md Verification (2026-03-29 Invocation 32)

Cross-referenced both audit reports (from main repo) against all existing tickets:

### DEEP-AUDIT-TICKETS.md (33 findings)

| Deep Audit ID | Mapped Ticket | Status |
|---|---|---|
| DA-S0-001 | S0-005 (standalone redirect) | OPEN |
| DA-S0-002 | S0-006 (no signup CTA mobile) | OPEN |
| DA-S0-003 | S0-007 (Bijan Robinson 2023) | OPEN |
| DA-S1-001 | S1-015 (dark mode ink-light) | OPEN |
| DA-S1-002 | S1-016 (lab sidebar overwhelm) | OPEN |
| DA-S1-003 | S1-017 (player profile loading) | OPEN |
| DA-S1-004 | SKIP — false positive (empty state exists in compare.js:24-32) | SKIP |
| DA-S1-005 | S1-018 (team page blank default) | OPEN |
| DA-S1-006 | S1-019 (pricing yearly billing) | OPEN |
| DA-S1-007 | S1-020 (scoring format selector) | OPEN |
| DA-S1-008 | S0-003 (client-side tier bypass) | DUPLICATE |
| DA-S1-009 | S1-021 (Nacua drop rate) | OPEN |
| DA-S1-010 | S0-008 (nav brand names) | DUPLICATE |
| DA-S1-011 | SKIP — false positive (toggle in mobile nav, app.js:188-202) | SKIP |
| DA-S1-012 | S2-100 (BYOK guide + model FAQ) | DUPLICATE |
| DA-S2-001 | S2-023 (hero 150 columns claim) | OPEN |
| DA-S2-002 | S2-024 (loading text overuse) | OPEN |
| DA-S2-003 | S2-025 (footer links mobile) | OPEN |
| DA-S2-004 | S2-026 (canvas hardcoded colors) | OPEN |
| DA-S2-005 | S2-027 (lab toolbar dense) | OPEN |
| DA-S2-006 | SKIP — not a bug (season selector correct) | SKIP |
| DA-S2-007 | S2-028 (RPS ignores production) | OPEN |
| DA-S2-008 | S2-029 (about page identity) | OPEN |
| DA-S2-009 | S2-030 (auth modal 375px) | OPEN |
| DA-S2-010 | S2-031 (no offline handling) | OPEN |
| DA-S2-011 | S2-032 (cmd palette mobile) | OPEN |
| DA-S2-012 | S2-033 (export locked no preview) | OPEN |
| DA-S2-013 | S2-034 (formula store behind auth) | OPEN |
| DA-S2-014 | S2-035 (cheatsheet print CSS) | OPEN |
| DA-S2-015 | S2-036 (situation room a11y) | OPEN |
| DA-S2-016 | S2-037 (meta descriptions) | OPEN |
| DA-S2-017 | S2-038 (records limited 2020) | OPEN |
| DA-S2-018 | S2-039 (no PNG favicon) | OPEN |

**Result**: 27 mapped to OPEN tickets, 3 DUPLICATE of existing tickets, 3 SKIP (false positives/not bugs). **0 new tickets needed.**

### STAT-AUDIT-REPORT.md (9 mismatches + 364 missing rows)

| Finding | Mapped Ticket | Status |
|---|---|---|
| Bijan Robinson 2023 rushing (-487 yds) | S0-007 | OPEN |
| Fotis Kokosioulis 2022 CFB rec_tds (+4) | S3-036 | OPEN |
| David Johnson 2015 rushing (-581 yds) | NOFIX — verifier name collision | NOFIX |
| David Johnson 2019 carries (-1) | S2-040 (implicit) | COVERED |
| Daniel Jones 2019 PPR (+2) | NOFIX — nflverse 2pt conv handling | NOFIX |
| Ryan Tannehill 2022 passing_tds (+1) | S2-040 | COVERED |
| 4 weekly first_downs (Darnold/Cousins/Edelman/Walker) | S2-040 | COVERED |
| 364 missing fringe player-weeks | S3-112 | OPEN |

**Result**: 4 mapped to OPEN tickets, 3 COVERED by S2-040, 2 NOFIX (false positives). **0 new tickets needed.**

### Ticket Count Summary (Final — Invocation 32)

| Severity | Count | Status |
|---|---|---|
| S0 | 8 | All OPEN |
| S1 | 45 | All OPEN |
| S2 | 132 | All OPEN |
| S3 | 116 | All OPEN |
| CEO | 18 | All OPEN |
| QA | 1 | All OPEN |
| **Total** | **320** | |

TSV entries: 478 (76 deep-audit + stat-audit entries verified this invocation)

### Invocation 33 — Code-level verification (2026-03-29)

1. **S3-036 enhanced** — Added file:line root cause detail for CFB TD attribution edge case. The bug is at `adapters/cfbfastr_adapter.py:250`: condition `if td_id and comp_id` doesn't verify the TD was scored by the receiver. Over-counts rec_tds when `touchdown_player_id` is set for a different player on the same play.

2. **S3-117 NEW** — Situation Room pixel canvas renders at ~342x251px on mobile (agents barely visible). From deep audit Phase 6 mobile concerns table. Root cause at `agents.html:257-273` and `warroom.js:8-12` — 960x704 canvas scales down uniformly with no mobile-specific UX.

3. **3 false positives re-verified**:
   - DA-S1-004 (compare.html): Confirmed empty state at compare.js:24-32 ("Pick two players first, boss")
   - DA-S1-011 (dark mode mobile): Confirmed toggle at app.js:188-202 (injected into mobile nav panel)
   - DA-S2-006 (season selector): Confirmed correct behavior

4. **3 skipped S3 numbers** (037, 048, 051): Numbering gaps — never assigned, not missing findings.

### Ticket Count Summary (Final — Invocation 33)

| Severity | Count | Status |
|---|---|---|
| S0 | 8 | All OPEN |
| S1 | 45 | All OPEN |
| S2 | 132 | All OPEN |
| S3 | 117 | All OPEN |
| CEO | 18 | All OPEN |
| QA | 1 | All OPEN |
| **Total** | **321** | |
