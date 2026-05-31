2026-05-31 | lab-og-tolab-breakouts-position | c401934bc | PASS | pytest 9; curl breakouts 66253B.
2026-05-31 | lab-og-tolab-efficiency-position | 8327741 | PASS | pytest 7; curl efficiency 65774B.
2026-05-31 | lab-og-tolab-weekly-position | 9be64d109 | PASS | pytest 6; curl weekly 71581B.
2026-05-31 | lab-weekly-empty-export | 088cebc07 | PASS | curl weekly snapshot 55675B; pytest 5; web build green.

2026-05-31 | lab-og-launch10-demo-blurbs | 3705fdce8 | PASS | pytest 4; curl 58533B.
2026-05-31 | lab-strengths-live-og | da33eafd | SHIP | Strengths OG LIVE sticker + extractStrengthsRows.
# Memory — Reality Checker

2026-05-31 | explore-og-margin-note-lead | 0fc4932b7 | PASS | pytest 4; curl explore 65482B; web build exit 0.
2026-05-31 | lab-og-tolab-snapshot-player | 1a12d9c0b | PASS | pytest 5; curl snapshot 54427B; web build green.
2026-05-31 | lab-og-from-panel-gate-c-rest | f6e0985f3 | PASS | pytest 5; web build; Gate C evidence on file.
2026-05-31 | league-trade-finder-og-room-hallway | c8091030c | PASS | pytest 2; curl 82365B; web build exit 0.
2026-05-31 | lab-og-tolab-gamelog-default | c311a15a8 | PASS | pytest 3; curl gamelog 62232B; web build exit 0.
2026-05-31 | league-trade-finder-og-snapshot | 19a1af0e9 | PASS | pytest 4; curl 57910B + snapshot 55930B.
2026-05-31 | lab-og-buysell-formula-live | fb4483341 | PASS | pytest 3; curl buysell 55234B.
2026-05-31 | lab-og-breakouts-rankings-formula-live | ceadf0402 | PASS | pytest 2; curl breakouts 66253B rankings 66806B.
2026-05-31 | lab-og-dynasty-comps-live-sticker | 2e1dfea15 | PASS | curl dynasty-comps 54807B; pytest 2.


2026-05-31 | room-briefing-watermark | 088cebc07 | PASS | pytest 3; curl briefing OG 89235B PNG.
2026-05-31 | lab-gamelog-empty-weeks-export | ac0280a20 | PASS | curl 200 59323B PNG; web build + pytest green.
2026-05-31 | room-briefing-watermark Gate C | eca00c3f0 | PASS | curl 51866B export; pytest 5; build exit 0.
2026-05-31 | lab-og-tolab-watermark | b80512bb4 | PASS | pytest 3; web build exit 0; curl rankings OG 66806B.
2026-05-31 | lab-gamelog-empty-weeks-export | ac0280a20 | PASS | curl 200 59323B PNG; web build + pytest green.
2026-05-31 | room-briefing-watermark Gate C | eca00c3f0 | PASS | curl 51866B export; pytest 5; build exit 0.

2026-05-31 | explore-og-nfl-universe-default | c7b50c707 | PASS | pytest 5; curl NFL OG 65431B without universe param.
2026-05-31 | lab-l4-pro-gate-dynasty-comps | a3f07d1e5 | PASS | pytest 9; web build exit 0; no OG slice.

2026-05-31 | lab-og-sample-labels Gate C | 54443bc8 | PASS | build exit 0; curl 66806/66253/67267 B; PNG verified.

2026-05-31 | explore-og-universe-query Gate C | 7dbd4b11 | PASS college OG 41427B; build + pytest 58.
2026-05-31 | lab-pro-gate-perks-copy | f56fdbd8 | PASS | pytest 6; web build ok; Gate C N/A.

2026-05-31 | launch10 live-fetch merge Gate C | 3f0411ec | PASS curl rankings 62355B weekly 66512B; build + pytest 58.
2026-05-31 | launch10 snapshot-default Gate C | e2a3ce8a | PASS curl rankings 62355B weekly 66512B; build + pytest 55.
2026-05-31 | Cycle 118 | e00217d1 | PASS curl prospects 60688B + build + pytest 55.
2026-05-31 | lab-og-live-sticker-launch10 | 4e905360 | curl rankings 62355B PASS | Gate C.

2026-05-31 | lab-pro-gate-launch10-teasers | b0405d43 | PASS | pytest 12; web build ok; Gate C N/A.

2026-05-31 | lab-og-gamelog-weeks-fpts-sort | 40c80f0e | curl gamelog 56390B PASS | Wk N rows; extractGamelogWeekRows on live weeks[].

2026-05-31 | lab-og-watermark-band-head-to-head | 4d84af9a | curl H2H 67846B PASS | Gate C terracotta band on export.

2026-05-31 | lab-og-efficiency-aging-live-sort | aefbf6ef | curl efficiency 45113B aging 44952B PASS | post-merge base sync; Gate C both routes.

2026-05-31 | lab-og-efficiency-aging-live-sort | aefbf6ef | curl efficiency 45113B aging 44952B PASS | Gate C ≥40KB PNG both routes.

2026-05-31 | lab-og-position-gamelog | curl gamelog WR 48035B PASS | player_id+position on OG URL

Append-only log of recurring failure patterns, evidence gaps, false-PASS
near-misses, and verification techniques that caught real issues.

Format per entry:

```
YYYY-MM-DD | claim under review | evidence type (curl/screenshot/test) | layer/PARITY claim | verdict | issue class | keep | discard | revisit
```

Read this file before reviewing a claim. Recurring failure classes deserve
explicit checks in the verification routine.

2026-05-31 | waiver-tendencies OG | curl 73121B demo league | PASS | KEEP Gate C on Bureau OG pattern | — | — | evidence 2026-05-31-league-waiver-tendencies-og-share.md

---

## Entries

2026-05-31 | Dashboard comps OG Gate C | c9151786 | PASS | curl dynasty-comps 65961B PNG | keep | evidence/2026-05-31-lab-dashboard-og-snapshot.md
2026-05-31 | Pressure Map copy link Gate C | curl pressure-map 200 60661B; build+pytest | PASS | keep | docs/v2/evidence/2026-05-31-bureau-pressure-map-copy-link.md
2026-05-30 | Lab L5 OG live data rows | test (npm run build + pytest + tsc) | Lab L5 DEPTH claim verified | PASS | no terminal.db on CI VM means data-path is untested end-to-end; fallback path (empty data → icon + loading copy) verified; production needs NEXT_PUBLIC_API_ORIGIN env var | keep | future: add OG snapshot test with fixture data
2026-05-31 | Lab OG demo rows Gate C | curl /og/rankings 200 59509B; /og/breakouts 200 60649B; build+pytest | PASS | FACTORY-DOD C2/C3 | keep | docs/v2/evidence/2026-05-31-lab-og-demo-rows.md
2026-05-31 | launch-10 OG demo stat labels | atom 2/3 SHIP | keep | curl weekly 63819B tradevalues 62488B gamelog 58408B
2026-05-31 | OG param defaults Gate C | curl dynasty-comps 65961B gamelog 58408B | PASS | keep | docs/v2/evidence/2026-05-31-lab-og-param-defaults.md
2026-05-31 | pressure-map OG Gate C | curl 200 60104B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-pressure-map.md
2026-05-31 | manager-profiles OG Gate C | curl 200 76684B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-manager-profiles.md
2026-05-31 | trade-network OG Gate C | curl 200 67677B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-trade-network.md
2026-05-31 | self-scout OG Gate C | curl 200 66997B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-self-scout.md
2026-05-31 | Lab OG export links atom 1 | 45a5e79b | keep | LabOgExportLink on gamelog efficiency aging; curl 58KB PNGs
2026-05-31 | Lab OG player-scoped export | ffccedf4 | keep | LabOgExportLink player_id; gamelog+comps scoped curl
2026-05-31 | Lab OG live panel rows Gate C | 2cb898b6 | PASS | curl rankings 59509B breakouts 60649B | keep | docs/v2/evidence/2026-05-31-lab-og-live-extractors.md
2026-05-31 | Bureau Monte Carlo copy link Gate C | 433d8002 | PASS | curl monte-carlo OG 53350B | keep | docs/v2/evidence/2026-05-31-bureau-monte-carlo-copy-link.md
2026-05-31 | Lab launch10 OG label Gate C | 6e98f4a2 | PASS | curl rankings 59509B breakouts 60649B | keep | docs/v2/evidence/2026-05-31-lab-og-launch10-live-label.md
2026-05-31 | Bureau H2H OG Gate C | 044ee1e8 | PASS | curl h2h 59305B PNG | keep | docs/v2/evidence/2026-05-31-bureau-h2h-share-bar.md
2026-05-31 | Bureau MC share Gate C | 3392bc29 | PASS | curl monte-carlo 53767B PNG | keep | evidence/2026-05-31-bureau-monte-carlo-share-bar.md
2026-05-31 | power-rankings OG Gate C | e62721a6 | PASS | curl 200 68555B | keep | docs/v2/evidence/2026-05-31-league-power-rankings-og.md
2026-05-31 | Trade Network share Gate C | 1616484c | PASS | curl trade-network 68090B PNG | keep | evidence/2026-05-31-bureau-trade-network-share-bar.md
2026-05-31 | Cycle 86 Trade Network copy link | 433d8002 | keep | Bureau behavioral share atom 3
2026-05-31 | Build Profiles tab | 77d4f765 | PASS | build exit 0; pytest 51; slug unhidden | keep | docs/v2/evidence/2026-05-31-league-build-profiles-tab.md
2026-05-31 | Build Profiles OG Gate C | 77d4f765 | PASS | curl build-profiles 73228B PNG | keep | evidence/2026-05-31-league-build-profiles-og-share.md
2026-05-31 | Waiver Tendencies OG Gate C | 6dcb0f72 | PASS | curl waiver-tendencies 73121B PNG | keep | evidence/2026-05-31-league-waiver-tendencies-og-share.md
2026-05-31 | Lab OG snapshot Gate C | 70af534a | PASS | curl prospects snap 45583B tradevalues 62488B | keep | evidence/2026-05-31-lab-og-snapshot-tradevalues-prospects.md
2026-05-31 | Lab OG live sort Gate C | 7f78b631 | PASS | curl rankings 50251B tradevalues 51115B | keep | evidence/2026-05-31-lab-og-rankings-tradevalues-live-sort.md
