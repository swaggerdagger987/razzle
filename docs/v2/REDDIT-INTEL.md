# Reddit & Market Intel

**GTM strategy:** `docs/v2/REDDIT.md` — Reddit is the only channel until MRR justifies expansion.

Opus updates this on odd cycles. Link real threads — no invented research.

## Template

```markdown
### YYYY-MM-DD — r/DynastyFF
- **Thread:** https://reddit.com/r/DynastyFF/...
- **What users want:**
- **What we lack:**
- **Feature ID:** F-XX
- **Council cycle:**
```

## Standing gaps to validate

- ~~College stats in same screener as NFL~~ → F-02 GREEN (Cycle 1)
- Trade value / KTC alternative narrative
- League-specific context vs generic rankings
- Screenshot-worthy share cards
- Mobile dynasty managers on Reddit app

## 2026-05-23 — Cycle 5

### r/DynastyFF — spring rookie draft season
- **Theme:** League-specific trade/sell context beats generic rankings; users pay for tools that know *their* roster.
- **Thread pattern:** "Would I accept this offer?" trade posts; rookie ADP + aging curves for sell-high windows.
- **Razzle gap (fixed):** Pro panels showed raw errors; Player Sheet league tab didn't show ownership; agents didn't inject roster status.
- **Feature IDs:** F-07, F-08, F-09 GREEN
- **Council cycle:** 5

### r/fantasyfootball recurring
- **Theme:** Free screener + paid depth (projections, trade tools) is the conversion funnel users expect.
- **Feature ID:** F-09 ProUpgradeGate

## 2026-05-23 — Cycle 8

### Market signal — dynasty trade value charts (not Reddit URLs — API 403)
- **Pattern:** r/DynastyFF threads share **position-filtered tier rankings** with numeric trade values (KTC, FantasyCalc, Justin Boone monthly charts). Users ask "where does X rank?" before trade posts.
- **Yahoo reference (competitor format):** Justin Boone 2026 dynasty trade value charts by position — tier blocks + assigned values, 12-team PPR.
- **Razzle gap (this cycle):** `/lab/rankings` was pro-gated JSON/tier stub — no Octo header, no Player Sheet link, no Room prefill, no position filter UI.
- **Slice:** Lab L1 `rankings` — DynastyRankingsRenderer + hallway wires
- **Council cycle:** 8
- **Bot-fact potential:** `!razzle <player>` dynasty value tier — future, intel layer

## 2026-05-23 — Cycle 11

### r/DynastyFF — weekly streak / start-sit heat
- **Pattern:** In-season threads ask "hot hand or fluke?" — users share **week-by-week scoring grids** and target-share spikes before waiver runs.
- **Competitor gap:** Generic season-long PPG lists hide cold streaks; heatmaps that show W1–W18 variance get screenshots.
- **Razzle slice:** Lab L1 `weekly` (free tier) — Hawkeye heatmap with position filter + Player Sheet + Room ask on peak week.
- **Council cycle:** 11
- **Bot-fact potential:** `!razzle confirm <player> hot streak` — compare last 3 weeks vs season PPG

## 2026-05-23 — Cycle 13

### r/DynastyFF — boom/bust via game logs (pattern; live thread fetch 403)
- **Pattern:** Managers argue start/sit and dynasty hold/sell using **week-by-week PPR** — boom weeks (20+) vs bust weeks (<10) drive the narrative more than season averages.
- **Competitor framing:** PFF boom/bust articles classify WR/RB busts as <10 PPR and booms as 20+ — same thresholds as legacy V1 gamelog color tiers.
- **Razzle slice:** Lab L1 `gamelog` (pro) — Atlas header, position-specific box score columns, season selector, Player Sheet deep link, Room ask on peak week.
- **Council cycle:** 13
- **Bot-fact potential:** `!razzle <player>` peak week + PPG — future intel layer

## 2026-05-23 — Cycle 21

### r/DynastyFF — Lab → Room context moat (pattern; live fetch 403)
- **Pattern:** Users screenshot Lab panels then ask follow-up questions in comments — tools that remember *which panel* you came from feel smarter than generic chatbots.
- **Razzle slice:** Hallway H-06 complete — all launch-10 Lab renderers pass `panelSlug` on `toRoom()` so agents reference the Lab surface in prompts.
- **Council cycle:** 21
- **Bot-fact potential:** N/A — prompt-level moat, not fact replies

## 2026-05-23 — Cycle 23

### r/DynastyFF — championship odds screenshot culture (pattern; live fetch 403)
- **Pattern:** Trade-deadline threads ask "contender or rebuilder?" — managers share **championship % boards** and power-ranking cards, not raw roster lists.
- **Competitor framing:** Sleeper playoff odds, FantasyPros power rankings — % bars + manager cards get upvoted in comment chains.
- **Razzle slice:** League L1 Bureau Monte Carlo — Octo header, championship odds summary cards sorted by %, Room ask on leader.
- **Council cycle:** 23
- **Bot-fact potential:** `!razzle confirm <manager> championship odds` — future intel layer

## 2026-05-23 — Cycle 25

### r/DynastyFF — college + prospect big board workflow (pattern; live fetch 403)
- **Pattern:** Rookie-draft threads cross-reference **CFB production** with **prospect tiers** — users hate switching sites mid-research.
- **Razzle slice:** Explore L2 college bridge — universe bar `big board →`, Player Sheet panels nudge when `?universe=college`, Hawkeye loading copy.
- **Council cycle:** 25

## 2026-05-23 — Cycle 27

### r/DynastyFF — contender vs rebuilder dual odds (pattern; live fetch 403)
- **Pattern:** Trade-deadline and mid-season threads ask "am I making playoffs or rebuilding?" — managers share **playoff % AND title %** side-by-side, not championship alone. Sleeper native shows playoff odds; dynasty managers want both metrics on one screenshot card.
- **Competitor framing:** Sleeper playoff bracket view, FantasyPros power rankings — dual-metric sticker cards (playoffs + title) get shared when debating sell windows.
- **Razzle gap:** Cycle 23 shipped championship-only odds cards; rebuilder posts need "68% playoffs / 4% title" framing to justify selling vets.
- **Slice:** League L2 Bureau Monte Carlo — `playoff_pct` alongside `championship_pct`, dual bars on odds cards, `playoff_spots` from Sleeper settings.
- **Council cycle:** 27
- **Bot-fact potential:** `!razzle confirm <manager> playoff odds` — future intel layer

## 2026-05-23 — Cycle 31

### r/DynastyFF — staff voice on tool screenshots (pattern; live fetch 403)
- **Pattern:** Screenshot posts that name the **analyst persona** ("my scout flagged breakouts") outperform generic dashboard dumps. Users trust tools that feel like a film room, not a spreadsheet export.
- **Razzle gap:** Launch-10 panels had hardcoded one-line subtitles diverging from catalog blurbs — registry drift when copy updates.
- **Slice:** Lab L2 panel subtitle registry — `PanelAgentHeader` reads `getPanel(slug).blurb` from `@razzle/panels` catalog.
- **Council cycle:** 31
- **Bot-fact potential:** N/A — voice consistency, not fact replies


### r/DynastyFF — daily dynasty briefing / market pulse (pattern; live fetch 403)
- **Pattern:** Dynasty managers want **one-screen pulse checks** — top assets, risers/fallers vs production rank, positional scarcity cliffs — before trade posts or morning Reddit threads.
- **Competitor framing:** KTC/FantasyCalc post tier moves; standalone "dashboard" UIs aggregate risers + value picks for screenshot shares.
- **Razzle slice:** Lab L1 `dashboard` (free) — Razzle header, top-5 dynasty value cards, risers/fallers/value columns, scarcity bars, Player Sheet + Room ask on top riser.
- **Council cycle:** 17
- **Bot-fact potential:** `!razzle confirm RB scarcity cliff` — position dropoff from dashboard scarcity row

- **Pattern:** Dynasty sell threads cite **position peak ages** — "RB cliff 27", "WR peak 24" — before dumping vets for picks. Users want PPG-by-age curves, not generic "he's old" takes.
- **Competitor framing:** DynastyProcess aging articles, KeepTradeCut sell windows — position-specific peak charts get shared in trade advice comments.
- **Razzle slice:** Lab L1 `aging` (pro) — Octo SVG curve, peak-age dashed line, past-peak player table, Player Sheet + Room sell-window ask.
- **Council cycle:** 15
- **Bot-fact potential:** `!razzle confirm <player> past peak` — compare age vs position peak from curve


### r/DynastyFF recurring theme
- **Gap:** Dynasty managers research college production alongside NFL stats; tools that split them across sites lose the workflow.
- **Razzle status:** F-02 shipped — NFL/College toggle on `/explore`, URL-persisted `?universe=college`.
- **Next:** F-06 pixel room, F-10 share cards for Reddit screenshots.
- League-specific context vs generic rankings
- Screenshot-worthy share cards
- Mobile dynasty managers on Reddit app

## 2026-05-23 — Cycle 33

### r/DynastyFF — full league odds board screenshots (pattern; live fetch 403)
- **Pattern:** Trade-deadline threads share **full-league odds boards** — every manager's title + playoff % on one screen, not just the top 3 sticker cards. Comment chains ask "where does 7th place land?" — compact grids beat hero cards alone.
- **Competitor framing:** Sleeper playoff bracket, FantasyPros power rankings grid — dense manager grids get shared when debating sell windows across the whole league.
- **Razzle gap:** Cycle 27 shipped dual-metric sticker cards for top managers; no compact grid showing all rosters at once.
- **Slice:** League L2 Bureau Monte Carlo — `League odds board` dense grid below hero cards, dual mini-bars per manager.
- **Council cycle:** 33
- **Bot-fact potential:** `!razzle confirm <league> odds board` — future intel layer

## 2026-05-23 — Cycle 36

### r/DynastyFF — screener composite → Lab panel workflow (pattern; live fetch 403)
- **Pattern:** Dynasty managers build weighted composites in screener tools, then want the **same weights applied inside Lab panels** (efficiency, breakouts, rankings) — not re-enter stats manually. Reddit OC posts show "my PPR Workhorse model" sorted tables; comment chains ask "does this hold on efficiency metrics too?"
- **Competitor framing:** DynastyProcess custom scoring articles, spreadsheet dashboards — users export CSV from screener and re-sort in Excel; friction kills screenshot velocity.
- **Razzle gap:** Cycles 30–34 shipped Explore formulas + store; Lab panels still use fixed panel sort (PPO, RBS) with no composite overlay.
- **Slice:** Lab L3 — `FormulaPanelBar` on efficiency panel reads `razzle_formulas` localStorage, fetches season stats via `/api/players/compare`, re-sorts tables + Octo Room ask with composite name.
- **Council cycle:** 36
- **Bot-fact potential:** `!razzle confirm <player> PPR Workhorse rank on efficiency panel` — future intel layer

## 2026-05-23 — Cycle 39

### r/DynastyFF — dynasty rankings vs custom composite (pattern; live fetch 403)
- **Pattern:** Trade-value tier posts ("Tier 2 WRs") get challenged in comments — "my model ranks him Tier 1" with weighted PPR/target-share composites. Managers screenshot **side-by-side dynasty value vs custom model** when debating sell windows.
- **Competitor framing:** KeepTradeCut tiers, FantasyCalc, DynastyProcess custom scoring — users export screener weights then manually re-rank in spreadsheets; friction kills screenshot velocity.
- **Razzle gap:** Cycles 36–37 wired `FormulaPanelBar` on efficiency + breakouts; dynasty rankings (Octo-owned, highest-traffic pro panel) still fixed to API tiers only.
- **Slice:** Lab L3 — `FormulaPanelBar` on rankings panel, composite re-sort flat list + formula score column, Octo Room ask with composite name.
- **Council cycle:** 39
- **Bot-fact potential:** `!razzle confirm <player> PPR Workhorse rank vs dynasty tier` — future intel layer

## 2026-05-23 — Cycle 41

### r/DynastyFF — buy-low / sell-high vs custom composite (pattern; live fetch 403)
- **Pattern:** Trade advice threads split **efficiency vs market rank** — "efficiency A but ranked 65th percentile, buy now" vs "ranked 90th but C efficiency, sell." Comment chains challenge with custom weighted models: "my Target Hog composite says buy despite low rank."
- **Competitor framing:** KeepTradeCut buy/sell lists, FantasyCalc value mismatches — users manually cross-reference screener composites against buy-low spreadsheets; friction kills screenshot velocity.
- **Razzle gap:** Cycles 36–40 wired `FormulaPanelBar` on efficiency, breakouts, rankings, trade-values; buy-sell (Bones, mismatch cards) still fixed to API efficiency-grade sort only.
- **Slice:** Lab L3 — `FormulaPanelBar` on buy-sell panel, composite re-sort within buy-low + sell-high columns, formula score on cards, Bones Room ask with composite vs rank mismatch.
- **Council cycle:** 41
- **Bot-fact potential:** `!razzle confirm <player> buy low on <composite>` — future intel layer

## 2026-05-23 — Cycle 34

### r/DynastyFF — community composite / formula store workflow (pattern; live fetch 403)
- **Pattern:** Dynasty screener posts share **named composites** ("PPR Workhorse", "Target Hog", "Bellcow Index") — users want one-click import, not building weights from scratch. Excel/dashboard tools (Dynasty FF Dashboard, DFT-style trade calcs) aggregate community formulas; Reddit OC screenshots show sorted composite columns with position filters.
- **Competitor framing:** DynastyProcess articles, KeepTradeCut tiers, FantasyPros custom scoring — pre-built weighted models get shared when debating breakout vs volume plays.
- **Razzle gap:** Cycle 30 shipped custom formula builder (L3); no curated store for community composites.
- **Slice:** Explore L4 formula store — static Razzle Labs catalog, position filter, one-click import to localStorage, sort by composite, Octo Room ask.
- **Council cycle:** 34
- **Bot-fact potential:** `!razzle confirm <player> PPR Workhorse rank` — future intel layer
