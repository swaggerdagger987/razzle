# Memory — Builder

Append-only log of implementation patterns, surgical wins, things to avoid.

Format per entry:

```
YYYY-MM-DD | slice | approach | commit hash | outcome | keep | discard | revisit | evidence
```

Read this file before implementing. Reuse working patterns; avoid repeating known
failure modes. Karpathy: simplicity first, surgical changes.

---

2026-05-31 | bureau-h2h-snapshot-export | encodeBureauH2HOgSnapshot + BureauH2HShareBar ogSnapshot prop | da33eafd | SHIP | KEEP compact H2H snapshot lib | — | decode on OG route atom 3 | evidence/2026-05-31-bureau-h2h-snapshot-export.md

---

## Entries

2026-05-31 | Lab OG weekly+breakouts snapshotRows | 98e51602 | keep | PPG weekly + RBS breakouts; curl weekly snap 64762B
2026-05-31 | Bureau Pressure Map copy link | c4ce09b7 | keep | copyPressureLink row; curl pressure-map 60661B
2026-05-31 | Bureau Manager Profiles copy link | 04c19959 | keep | copyProfilesLink row; curl manager-profiles 77194B
2026-05-31 | Bureau Self-Scout copy link | 3fc08ebc | keep | copyScoutLink row; curl self-scout 66997B
2026-05-30 | Lab L5 OG — rewrite /og/[panel]/route.tsx with live data fetch, agent badge, position pills | 2e11270 | keep | Single file ~250 lines; follows Explore OG pattern from cycle 55; 13 stat candidate keys; graceful fallback to icon+loadingCopy when API returns empty
2026-05-31 | Lab OG demo rows — DEFAULT_DEMO_ROWS + slug overrides, isDemo flag, Satori blurb fix | 0019814f | keep | Mirrors H2H demo pattern; removed loading-only empty state; Gate C curl 59KB PNG
2026-05-31 | launch-10 OG demo stat labels | atom 2/3 SHIP | keep | curl weekly 63819B tradevalues 62488B gamelog 58408B
2026-05-31 | OG default player_id + dynasty-comps demo | ef908a99 | keep | resolvePanelApiPath; DEFAULT_OG_PLAYER_ID; curl dynasty-comps 65961B
2026-05-31 | Pressure Map OG + export button | 0d39635e | keep | /og/pressure-map DEMO_ROWS; BureauPressureMap export link; curl 60104B
2026-05-31 | Manager Profiles OG + export | ffccedf4 | keep | /og/manager-profiles 4 archetype rows; BureauManagerProfiles export; curl 76684B
2026-05-31 | Trade Network OG + export | 2bd28752 | keep | /og/trade-network 4 partnership lanes; BureauTradeNetwork export; curl 67677B
2026-05-31 | Self-Scout OG + export | e732f973 | keep | /og/self-scout 4 position grades; BureauSelfScout export; curl 66997B
2026-05-31 | Lab OG export links atom 1 | 45a5e79b | keep | LabOgExportLink on gamelog efficiency aging; curl 58KB PNGs
2026-05-31 | Lab OG player-scoped export | ffccedf4 | keep | LabOgExportLink player_id; gamelog+comps scoped curl
2026-05-31 | Lab OG live panel rows | 2cb898b6 | keep | fetchLiveOgRows panels slug + candidates extract; curl rankings 59509B breakouts 60649B
2026-05-31 | Bureau H2H share bar | 044ee1e8 | keep | BureauH2HShareBar copy link + export; OG blurb Satori fix; curl 59305B
2026-05-31 | Bureau Monte Carlo share bar | 3392bc29 | keep | BureauMonteCarloShareBar; curl monte-carlo OG 53767B
