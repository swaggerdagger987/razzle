2026-05-31 | league-og-pressure-map-room-hallway | f6e0985f3 | SHIP | 2 files; mirror trade-finder OG hallway contract.
2026-05-31 | lab-og-tolab-weekly-position | 9be64d109 | SHIP | TOLAB_DEFAULT_POSITION + watermarkPosition.
2026-05-31 | lab-og-tolab-snapshot-player | 1a12d9c0b | 3 files; decodeOgSnapshot pid + labOgWatermarkLink snapshotPlayerId.
2026-05-31 | lab-weekly-empty-export | 088cebc07 | SHIP | WeeklyHeatmapRenderer + pytest; ≤55 lines.
2026-05-31 | lab-og-launch10-demo-blurbs | 3705fdce8 | 2 files; demo blurb parity.
2026-05-31 | lab-strengths-live-og | da33eafd | SHIP | Strengths OG LIVE sticker + extractStrengthsRows.
# Memory — Engineering Architect

2026-05-31 | league-trade-finder-og-room-hallway | c8091030c | 3 files; mirrors H2H atlasRoomPath pattern for Bones.
2026-05-31 | lab-og-from-panel-gate-c-rest | f6e0985f3 | 2 files pytest-only; SNAPSHOT_FROM_PANEL_SLUGS extended.
2026-05-31 | lab-og-tolab-gamelog-default | c311a15a8 | 2 files; includeDefaultPlayer guard in labOgWatermarkLink.
2026-05-31 | lab-og-buysell-formula-live | fb4483341 | 2 files; extractBuySellRows + buysellStatKeys.

2026-05-31 | lab-og-dynasty-comps-live-sticker | 2e1dfea15 | SHIP | PLAYER_SCOPED_LIVE_STICKER_SLUGS excludes Launch-10 gamelog.

2026-05-31 | room-briefing-watermark | 088cebc07 | 2 files; watermark band matches Explore/H2H OG pattern.
2026-05-31 | lab-gamelog-empty-weeks-export | ac0280a20 | 1 file GamelogRenderer; footer LabOgExportLink ≤15 lines.

2026-05-31 | room-briefing-watermark | eca00c3f0 | 3 files; BriefingCard mirrors ExploreShareButton; OG band uses roomPath.
2026-05-31 | lab-og-tolab-watermark | b80512bb4 | 2 files; labOgWatermarkLink mirrors briefing toRoom pattern.

2026-05-31 | lab-gamelog-empty-weeks-export | ac0280a20 | 1 file GamelogRenderer; footer LabOgExportLink ≤15 lines.

2026-05-31 | room-briefing-watermark | eca00c3f0 | 3 files; BriefingCard mirrors ExploreShareButton; OG band uses roomPath.


2026-05-31 | lab-og-sample-labels | 54443bc8 | 1 file route.tsx; launch10DemoStickerLabel + blurbs ≤30 lines.

2026-05-31 | explore-og-universe-query | 7dbd4b11 | 3-file slice; bandParams mirrors export query string.
2026-05-31 | pro gate perks | f56fdbd8 | keep | 4 files; catalog-driven labels; pytest guards.

2026-05-31 | launch10 live-fetch merge | 3f0411ec | route.tsx merge; sticker + fetchOgLiveRows + extractors.
2026-05-31 | fetchOgLiveRows launch-10 | e2a3ce8a | panel API + pro header before panels slug; demo last.
2026-05-31 | Cycle 118 | e00217d1 | prospectSources loop in route.tsx.
2026-05-31 | lab-og-live-sticker-launch10 | 4e905360 | 1-file panel route; LIVE sticker gated on showingLiveData.

2026-05-31 | launch10 teaser audit | b0405d43 | keep | 2 files; LAUNCH_10_* exports + pytest guard.

2026-05-31 | gamelog weeks extract | 40c80f0e | 1-file ~35 lines; player-scoped weeks[] not players[]; no PANEL_OG_STAT_KEY.

2026-05-31 | lab-og-watermark-band-head-to-head | 44d05684 | 1-file H2H OG; band copied from panel route; atlas link above band.

2026-05-31 | lab-og-efficiency-aging-live-sort | aefbf6ef | merge most_efficient + aging single-position unwrap; buysell/dashboard keys from base.

2026-05-31 | lab-og-efficiency-aging-live-sort | aefbf6ef | 1-file contract; pass position into extractRows for aging nested API.

2026-05-31 | tradevalues snapshot contract | 5ed39e14 | 1-file ≤25 lines; rank+formula statLabel pattern matches buysell

2026-05-31 | buysell snapshot contract | 98ae0ef2 | 1-file ≤35 lines; reuse encodeOgSnapshot; no route touch

Append-only log of architecture decisions, boundary lessons, recurring failure modes.

Format per entry:

```
YYYY-MM-DD | hypothesis | implementation boundary | ACCEPTANCE check | outcome | keep | discard | revisit | evidence
```

Read this file before scoping a new slice. Track which boundaries failed before,
which migrations were painful, which test patterns caught bugs.

---

## Entries

2026-05-31 | WeeklyHeatmap hot-week snapshot | 1 file ≤45 lines | SHIP | keep | max-week map sort mirrors panel hotPlayer logic

2026-05-31 | BureauPressureMap copy link | 1 file ≤35 lines | SHIP | keep | mirrors ManagerProfiles clipboard row
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
2026-05-31 | BureauMonteCarlo clipboard | 433d8002 | keep | useCallback + copied state mirrors Self-Scout; no OG route change
2026-05-31 | Bureau Monte Carlo clipboard | 088cebc07 | keep | merge sync base Lab epic; OG Razzle spans; dedup H2H ShareBar
2026-05-31 | panelBlurbSuffix launch-10 | 6e98f4a2 | keep | 1 file; LAUNCH_10_OG_SLUGS mirrors LabSidebar STAFF_PICKS
2026-05-31 | BureauH2HShareBar | 044ee1e8 | keep | ExploreShareButton parity; OG subtitle template string for Satori
2026-05-31 | BureauMonteCarloShareBar | 3392bc29 | keep | scenario query preserved in copy sim link
2026-05-31 | BureauTradeNetworkShareBar | 088cebc07 | keep | mirrors MC share bar; league OG param unchanged
2026-05-31 | /og/power-rankings | 9714bfa6 | keep | league-only POST; DEMO_ROWS; pressure-map OG layout
2026-05-31 | BureauBuildProfiles | 088cebc07 | keep | 3 files ≤172 lines; mirrors ManagerProfiles card grid; no API change
2026-05-31 | lab-og-rankings-tradevalues-live-sort | 7f78b631 | keep | 1 file route.tsx; PANEL_OG_STAT_KEY + tradevalues formula_score order
