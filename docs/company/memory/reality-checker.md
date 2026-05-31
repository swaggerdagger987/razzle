# Memory — Reality Checker

2026-05-31 | lab-l4-pro-gate-error-tradevalues | da33eafd | PASS build + pytest 5; no OG Gate C.
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
2026-05-31 | Bureau Monte Carlo copy link Gate C | da33eafd | PASS | curl monte-carlo OG 53350B | keep | docs/v2/evidence/2026-05-31-bureau-monte-carlo-copy-link.md
2026-05-31 | Lab launch10 OG label Gate C | 6e98f4a2 | PASS | curl rankings 59509B breakouts 60649B | keep | docs/v2/evidence/2026-05-31-lab-og-launch10-live-label.md
2026-05-31 | Bureau H2H OG Gate C | 044ee1e8 | PASS | curl h2h 59305B PNG | keep | docs/v2/evidence/2026-05-31-bureau-h2h-share-bar.md
2026-05-31 | Bureau MC share Gate C | 3392bc29 | PASS | curl monte-carlo 53767B PNG | keep | evidence/2026-05-31-bureau-monte-carlo-share-bar.md
2026-05-31 | power-rankings OG Gate C | e62721a6 | PASS | curl 200 68555B | keep | docs/v2/evidence/2026-05-31-league-power-rankings-og.md
2026-05-31 | Trade Network share Gate C | 1616484c | PASS | curl trade-network 68090B PNG | keep | evidence/2026-05-31-bureau-trade-network-share-bar.md
2026-05-31 | Cycle 86 Trade Network copy link | da33eafd | keep | Bureau behavioral share atom 3
2026-05-31 | Build Profiles tab | da33eafd | PASS | build exit 0; pytest 51; slug unhidden | keep | docs/v2/evidence/2026-05-31-league-build-profiles-tab.md
2026-05-31 | Build Profiles OG Gate C | 77d4f765 | PASS | curl build-profiles 73228B PNG | keep | evidence/2026-05-31-league-build-profiles-og-share.md
2026-05-31 | Waiver Tendencies OG Gate C | 6dcb0f72 | PASS | curl waiver-tendencies 73121B PNG | keep | evidence/2026-05-31-league-waiver-tendencies-og-share.md
2026-05-31 | Lab OG snapshot Gate C | 70af534a | PASS | curl prospects snap 45583B tradevalues 62488B | keep | evidence/2026-05-31-lab-og-snapshot-tradevalues-prospects.md
2026-05-31 | Lab OG live sort Gate C | 7f78b631 | PASS | curl rankings 50251B tradevalues 51115B | keep | evidence/2026-05-31-lab-og-rankings-tradevalues-live-sort.md
