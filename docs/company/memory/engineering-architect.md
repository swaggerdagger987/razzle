# Memory — Engineering Architect

Append-only log of architecture decisions, boundary lessons, recurring failure modes.

Format per entry:

```
YYYY-MM-DD | hypothesis | implementation boundary | ACCEPTANCE check | outcome | keep | discard | revisit | evidence
```

Read this file before scoping a new slice. Track which boundaries failed before,
which migrations were painful, which test patterns caught bugs.

---

## Entries

2026-05-30 | Generic extractRows() with 7 response shapes handles all 100 panels without per-panel switch | apps/web/app/og/[panel]/route.tsx | ACCEPTANCE Gate 2 (Lab renderers) | keep | Satori constraints: display:flex everywhere, no grid; agentForPanel() from @razzle/agents avoids metadata duplication; parameterized API paths ({player_id}) correctly skipped
2026-05-31 | demoRowsForPanel() + isDemo mirrors H2H; blurb must be single JSX text child for Satori | apps/web/app/og/[panel]/route.tsx | FACTORY-DOD Gate C | keep | Two adjacent text children in blurb div caused Satori pipe failure — template string fix
2026-05-31 | launch-10 OG demo stat labels | atom 2/3 SHIP | keep | curl weekly 63819B tradevalues 62488B gamelog 58408B
2026-05-31 | PLAYER_SCOPED_SLUGS + path resolver | ef908a99 | keep | only dynasty-comps has {player_id} in catalog path today
2026-05-31 | pressure-map OG | H2H pattern POST + DEMO_ROWS | 0d39635e | keep | 2 files ≤280 lines
2026-05-31 | manager-profiles OG | same pattern + archetype color map | ffccedf4 | keep | 2 files; ARCHETYPE_COLORS on OG card
2026-05-31 | trade-network OG | POST /api/bureau/trade-network + DEMO_EDGES | 2bd28752 | keep | 2 files; hero collusion callout on OG
2026-05-31 | self-scout OG | POST /api/bureau/self-scout + grade helpers | e732f973 | keep | 2 files; POS_COLORS; Hawkeye badge
2026-05-31 | Lab OG export links atom 1 | 45a5e79b | keep | LabOgExportLink on gamelog efficiency aging; curl 58KB PNGs
2026-05-31 | Lab OG player-scoped export | ffccedf4 | keep | LabOgExportLink player_id; gamelog+comps scoped curl
2026-05-31 | fetchLiveOgRows + candidates | 2cb898b6 | keep | X-Razzle-Plan pro header; legacy API fallback chain
2026-05-31 | BureauH2HShareBar | 044ee1e8 | keep | ExploreShareButton parity; OG subtitle template string for Satori
2026-05-31 | BureauMonteCarloShareBar | 3392bc29 | keep | scenario query preserved in copy sim link
2026-05-31 | power-rankings OG route | 46aeb445 | keep | mirrors pressure-map; diff bars + luck tags
2026-05-31 | BureauRosterDepth | 2d11a65f | keep | Self-Scout depth grade pattern; 3-file contract
