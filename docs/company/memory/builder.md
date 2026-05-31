# Memory — Builder

Append-only log of implementation patterns, surgical wins, things to avoid.

Format per entry:

```
YYYY-MM-DD | slice | approach | commit hash | outcome | keep | discard | revisit | evidence
```

Read this file before implementing. Reuse working patterns; avoid repeating known
failure modes. Karpathy: simplicity first, surgical changes.

---

## Entries

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
2026-05-31 | Lab OG dynasty-comps panel export supplement | b7deed67 | keep | DynastyCompsPanel + DEFAULT_LAB_OG_PLAYER_ID on gamelog
2026-05-31 | Lab OG snapshot rows atom 1/4 | 916ba843 | keep | snapshot query; dashboard risers curl 45249B
2026-05-31 | LabOgExportLink rankings+breakouts | 32d682ab | keep | 2 renderer footers on latest base; curl rankings 59509B breakouts 60649B
2026-05-31 | Lab OG snapshot buysell/efficiency/aging | snapshotRows useMemo | 33808392 | keep | 3 renderers | — | — | evidence/2026-05-31-lab-og-snapshot-launch10-panels.md
2026-05-31 | Lab OG snapshot gamelog/comps | Wk N + Match % rows | 75c88d30 | keep | 2 renderers | curl gamelog 40520B comps 47292B
2026-05-31 | Lab OG live-label subtitles | ogSourceSuffix in route.tsx | e31a59f1 | keep | 1 file | curl rankings 59509B
2026-05-31 | BureauRosterDepth renderer | BureauFeatureBody + bureau-features | da33eafd | keep | build+pytest PASS; Player Sheet clicks
2026-05-31 | Lab OG live panel rows | 2cb898b6 | keep | fetchLiveOgRows panels slug + candidates extract; curl rankings 59509B breakouts 60649B
