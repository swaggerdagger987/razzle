# Memory — Reality Checker

2026-05-31 | H2H codec Gate C | 64c762be | curl demo 71895B snapshot 70829B; PASS

2026-05-31 | tradevalues OG Gate C | 5ed39e14 | curl demo 62488B snap 62441B; PASS

2026-05-31 | buysell OG Gate C | 98ae0ef2 | curl demo 58072B snap 57884B; PASS

Append-only log of recurring failure patterns, evidence gaps, false-PASS
near-misses, and verification techniques that caught real issues.

Format per entry:

```
YYYY-MM-DD | claim under review | evidence type (curl/screenshot/test) | layer/PARITY claim | verdict | issue class | keep | discard | revisit
```

Read this file before reviewing a claim. Recurring failure classes deserve
explicit checks in the verification routine.

2026-05-31 | weekly OG hot-week snapshot ≥40KB | curl localhost PNG snap 51665B demo 63819B | Lab L5 OG | PASS | — | KEEP Wk N label in snapshot curl | — | evidence 2026-05-31-lab-weekly-hot-week-snapshot

2026-05-31 | dashboard OG snapshot ≥40KB | curl localhost PNG | Lab L5 OG | PASS | — | KEEP snapshot param curl | — | evidence 2026-05-31-lab-dashboard-top5-og-snapshot

---

## Entries

2026-05-31 | league-waiver-tendencies | PASS | pytest 51 + web build; no OG | keep | — | evidence/2026-05-31-league-waiver-tendencies-tab.md

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
2026-05-31 | Bureau Monte Carlo copy link Gate C | 64c762be | PASS | curl monte-carlo OG 53350B | keep | docs/v2/evidence/2026-05-31-bureau-monte-carlo-copy-link.md
2026-05-31 | Lab launch10 OG label Gate C | 6e98f4a2 | PASS | curl rankings 59509B breakouts 60649B | keep | docs/v2/evidence/2026-05-31-lab-og-launch10-live-label.md
2026-05-31 | Bureau H2H OG Gate C | 044ee1e8 | PASS | curl h2h 59305B PNG | keep | docs/v2/evidence/2026-05-31-bureau-h2h-share-bar.md
2026-05-31 | Bureau MC share Gate C | 3392bc29 | PASS | curl monte-carlo 53767B PNG | keep | evidence/2026-05-31-bureau-monte-carlo-share-bar.md
2026-05-31 | power-rankings OG Gate C | e62721a6 | PASS | curl 200 68555B | keep | docs/v2/evidence/2026-05-31-league-power-rankings-og.md
2026-05-31 | Trade Network share Gate C | 1616484c | PASS | curl trade-network 68090B PNG | keep | evidence/2026-05-31-bureau-trade-network-share-bar.md
2026-05-31 | Cycle 86 Trade Network copy link | 64c762be | keep | Bureau behavioral share atom 3
2026-05-31 | Build Profiles tab | 64c762be | PASS | build exit 0; pytest 51; slug unhidden | keep | docs/v2/evidence/2026-05-31-league-build-profiles-tab.md
