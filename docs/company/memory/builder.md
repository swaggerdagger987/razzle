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

2026-05-31 | Lab L5 LabOgExportLink weekly/prospects | 2 renderers footer swap | e84acacf | keep | curl weekly 63819B prospects 58084B; launch-10 epic complete
2026-05-31 | Lab L5 LabOgExportLink rankings/tradevalues/breakouts | import + footer swap in 3 renderers | 8a8ec279 | keep | Mechanical replace of raw `<a>` tags; curl all ≥59KB | atom 2: weekly/prospects

2026-05-30 | Lab L5 OG — rewrite /og/[panel]/route.tsx with live data fetch, agent badge, position pills | 2e11270 | keep | Single file ~250 lines; follows Explore OG pattern from cycle 55; 13 stat candidate keys; graceful fallback to icon+loadingCopy when API returns empty
2026-05-31 | BreakoutsRenderer LabOgExportLink.position | 1 file footer | 95183c27 | keep | curl WR 61718B breakouts 60649B; OG route unchanged
2026-05-31 | LabOgExportLink.position + OG apiParams.position + demo filter | 9e97afb7 | keep | Three-file slice; WR curl 50210B; mirrors Explore pos-on-OG pattern
2026-05-31 | Lab OG demo rows — DEFAULT_DEMO_ROWS + slug overrides, isDemo flag, Satori blurb fix | 0019814f | keep | Mirrors H2H demo pattern; removed loading-only empty state; Gate C curl 59KB PNG
2026-05-31 | launch-10 OG demo stat labels | atom 2/3 SHIP | keep | curl weekly 63819B tradevalues 62488B gamelog 58408B
2026-05-31 | OG default player_id + dynasty-comps demo | ef908a99 | keep | resolvePanelApiPath; DEFAULT_OG_PLAYER_ID; curl dynasty-comps 65961B
2026-05-31 | Pressure Map OG + export button | 0d39635e | keep | /og/pressure-map DEMO_ROWS; BureauPressureMap export link; curl 60104B
2026-05-31 | Manager Profiles OG + export | ffccedf4 | keep | /og/manager-profiles 4 archetype rows; BureauManagerProfiles export; curl 76684B
2026-05-31 | Trade Network OG + export | 2bd28752 | keep | /og/trade-network 4 partnership lanes; BureauTradeNetwork export; curl 67677B
2026-05-31 | Self-Scout OG + export | e732f973 | keep | /og/self-scout 4 position grades; BureauSelfScout export; curl 66997B
2026-05-31 | Lab OG export links atom 1 | 45a5e79b | keep | LabOgExportLink on gamelog efficiency aging; curl 58KB PNGs
2026-05-31 | Lab OG dynasty-comps panel export supplement | b7deed67 | keep | DynastyCompsPanel + DEFAULT_LAB_OG_PLAYER_ID on gamelog
2026-05-31 | Lab OG prospects position filter | da33eafd | keep | ProspectsRenderer LabOgExportLink.position; curl WR 49KB
