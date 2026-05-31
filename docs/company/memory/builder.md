# Memory — Builder

2026-05-31 | bureau-self-scout-sharebar-snapshot | 1a1def3e | keep | ShareBar + snapshot lib + OG decode.
2026-05-31 | lab-og-sample-labels-rankings-tv-breakouts | 54443bc8 | SHIP | launch10DemoStickerLabel 3 slugs; curl triple PASS.
2026-05-31 | LabOgExportLink player-scoped default | PLAYER_SCOPED_LAB_OG_SLUGS; gamelog export always has player_id | SHIP | keep | curl 60634B
2026-05-31 | lab-l4-pro-gate-error-surface | 5721ee33 | ProGateFromPanelError on BreakoutsRenderer; pytest 7.
2026-05-31 | lab-og-live-sticker-rankings-breakouts-tv | ad24a219 | SHIP | launch10LiveStickerLabel 3 slugs.
2026-05-31 | lab-sidebar-search-agent-labels | e75ec714 | keep | showOwnerInTitle prefixes search hits with agent name.

2026-05-31 | explore OG universe export | resolveApiOrigin + explicit copy URL + apiSortKey | SHIP | keep | 3 files | curl nfl/college ≥34KB

2026-05-31 | launch10 snapshot-default | e2a3ce8a | fetchOgLiveRows; OG_FETCH_HEADERS; curl rankings 62355B weekly 66512B.
2026-05-31 | Cycle 118 prospects OG items | e00217d1 | items[] RPS extract when prospects empty; curl 60688B.
2026-05-31 | lab-og-live-sticker-launch10 | 4e905360 | teal LIVE sticker on Launch-10 when showingLiveData.

2026-05-31 | lab-og-watermark-band-head-to-head | 44d05684 | H2H OG terracotta band; curl 67846B.

2026-05-31 | lab-og-efficiency-aging-live-sort | aefbf6ef | keep | ppo+most_efficient; aging ppg+positions unwrap; merged base buysell/dashboard keys.

2026-05-31 | lab-og-buysell-dashboard-live-sort | cb59494b | keep | dynasty_value/rank_diff; buy_low/sell_high extract; curl ≥44KB.


2026-05-31 | lab-og-efficiency-aging-live-sort | OG route ppo/ppg + aging positions unwrap | aefbf6ef | SHIP | keep | 1 file | curl 45KB×2

2026-05-31 | lab-og-position-gamelog | GamelogRenderer position on LabOgExportLink | 228c4b59 | SHIP | keep | 1 file | curl 48035B

2026-05-31 | league-strength-of-schedule-og-share | ShareBar + OG route | 7f652a98 | SHIP | keep | | | 3 files
2026-05-31 | league-power-rankings-og-snapshot | 26a22f69 | keep | compact encode/decode lib + ShareBar rows prop

2026-05-31 | H2H canonical codec | 7f652a98 | BureauH2HShareBar uses encodeBureauH2HOgSnapshot; OG route decodeBureauH2HOgSnapshot.

2026-05-31 | Trade values OG rank labels | 5ed39e14 | TradeValuesRenderer ogSnapshotRows uses `rank · Value` or `rank · formula.name` on top 6 sorted rows.

2026-05-31 | Buy/Sell OG lane labels | 98ae0ef2 | BuySellRenderer splits buyRows/sellRows with Buy/Sell statLabel before encodeOgSnapshot.

Append-only log of implementation patterns, surgical wins, things to avoid.

Format per entry:

```
YYYY-MM-DD | slice | approach | commit hash | outcome | keep | discard | revisit | evidence
```

Read this file before implementing. Reuse working patterns; avoid repeating known
failure modes. Karpathy: simplicity first, surgical changes.

---

2026-05-31 | weekly-hot-week-og | ogSnapshotRows max week pts + Wk label | 7f652a98 | SHIP | KEEP hottest-week not PPG | — | — | evidence/2026-05-31-lab-weekly-hot-week-snapshot.md

2026-05-31 | bureau-h2h-snapshot-export | encodeBureauH2HOgSnapshot + BureauH2HShareBar ogSnapshot prop | 7f652a98 | SHIP | KEEP compact H2H snapshot lib | — | decode on OG route atom 3 | evidence/2026-05-31-bureau-h2h-snapshot-export.md
2026-05-31 | DashboardRenderer snapshotRows | c9151786 | keep | comps match % on dynasty-comps OG; curl 65961B
2026-05-31 | league-waiver-tendencies-og-share | Hawkeye OG + share bar; pickHero hoarder-first | 6dcb0f72 | SHIP | KEEP FAAB bar from faab_spent | — | — | evidence 2026-05-31-league-waiver-tendencies-og-share.md

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
2026-05-31 | Bureau Monte Carlo copy link | 433d8002 | keep | copyMonteCarloLink mirrors Self-Scout; curl monte-carlo OG 53350B
2026-05-31 | Bureau Monte Carlo copy link morning | 7f652a98 | keep | copyMonteCarloLink row; H2H dedup ShareBar on base; curl monte-carlo 53350B
2026-05-31 | Lab OG launch10 live label | 6e98f4a2 | keep | panelBlurbSuffix + LAUNCH_10_OG_SLUGS; namedLiveRows; curl rankings 59509B
2026-05-31 | Bureau H2H share bar | 044ee1e8 | keep | BureauH2HShareBar copy link + export; OG blurb Satori fix; curl 59305B
2026-05-31 | Bureau Monte Carlo share bar | 3392bc29 | keep | BureauMonteCarloShareBar; curl monte-carlo OG 53767B
2026-05-31 | Bureau power-rankings OG | e62721a6 | keep | /og/power-rankings route + export link; curl 68555B
2026-05-31 | Bureau Trade Network share bar | 1616484c | keep | BureauTradeNetworkShareBar; curl trade-network OG 68090B
2026-05-31 | Cycle 86 Trade Network copy link | 7f652a98 | keep | Bureau behavioral share atom 3
2026-05-31 | league-build-profiles-tab | 7f652a98 | keep | BureauBuildProfiles Atlas archetype grid; unhide slug; build PASS pytest 51
2026-05-31 | league-roster-depth-og-share | 688cea64 | keep | /og/roster-depth Hawkeye grades; curl 57282B; BureauRosterDepthShareBar
2026-05-31 | league-build-profiles-og-share | 77d4f765 | keep | /og/build-profiles Atlas archetypes; curl 73228B; BureauBuildProfilesShareBar
2026-05-31 | league-waiver-tendencies-og-share | 6dcb0f72 | SHIP | /og/waiver-tendencies 73121B; BureauWaiverTendenciesShareBar
2026-05-31 | league-strength-of-schedule-tab | eb542d51 | keep | BureauStrengthOfSchedule; HIDDEN_BUREAU_SLUGS empty; epic 3/3
2026-05-31 | lab-og-rankings-tradevalues-live-sort | 7f78b631 | keep | dynasty_value + trade_value OG sort; curl 50KB PNGs
