# Memory — Reality Checker

Append-only log of recurring failure patterns, evidence gaps, false-PASS
near-misses, and verification techniques that caught real issues.

Format per entry:

```
YYYY-MM-DD | claim under review | evidence type (curl/screenshot/test) | layer/PARITY claim | verdict | issue class | keep | discard | revisit
```

Read this file before reviewing a claim. Recurring failure classes deserve
explicit checks in the verification routine.

---

## Entries

2026-05-30 | Lab L5 OG live data rows | test (npm run build + pytest + tsc) | Lab L5 DEPTH claim verified | PASS | no terminal.db on CI VM means data-path is untested end-to-end; fallback path (empty data → icon + loading copy) verified; production needs NEXT_PUBLIC_API_ORIGIN env var | keep | future: add OG snapshot test with fixture data
2026-05-31 | Lab OG demo rows Gate C | curl /og/rankings 200 59509B; /og/breakouts 200 60649B; build+pytest | PASS | FACTORY-DOD C2/C3 | keep | docs/v2/evidence/2026-05-31-lab-og-demo-rows.md
2026-05-31 | launch-10 OG demo stat labels | atom 2/3 SHIP | keep | curl weekly 63819B tradevalues 62488B gamelog 58408B
2026-05-31 | OG param defaults Gate C | curl dynasty-comps 65961B gamelog 58408B | PASS | keep | docs/v2/evidence/2026-05-31-lab-og-param-defaults.md
2026-05-31 | pressure-map OG Gate C | curl 200 60104B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-pressure-map.md
2026-05-31 | manager-profiles OG Gate C | curl 200 76684B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-manager-profiles.md
2026-05-31 | trade-network OG Gate C | curl 200 67677B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-trade-network.md
2026-05-31 | self-scout OG Gate C | curl 200 66997B PNG | PASS | keep | docs/v2/evidence/2026-05-31-league-og-self-scout.md
2026-05-31 | Lab OG export links atom 1 | 45a5e79b | keep | LabOgExportLink on gamelog efficiency aging; curl 58KB PNGs
2026-05-31 | Lab export atom 2 Gate C | 497d1df5 | PASS | curl buysell 58072B dashboard 60034B; PR50 merged; merge-base ON_BASE
