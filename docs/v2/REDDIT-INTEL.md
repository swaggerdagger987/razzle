# Reddit & Market Intel

**GTM strategy:** `docs/v2/REDDIT.md` — Reddit is the only channel until MRR justifies expansion.

### 2026-05-31 — Bureau Power Rankings (cycle 80)
- **Angle:** Beyond W-L boards travel — managers share differential + luck bars in league chats.
- **Screenshot hook:** Octo power board OG with green/orange diff bars and #1 callout.

### 2026-05-31 — Bureau Pressure Map (cycle 79)
- **Angle:** Deadline panic charts travel in league chats — copy chart link drops managers on Bones' pressure board.
- **Screenshot hook:** Red/orange panic bars + export card for the most desperate roster.

### 2026-05-31 — Bureau H2H (cycle 73)
- **Angle:** League rivalry cards with copyable URLs — managers share H2H dossiers in league group chats.
- **Screenshot hook:** Atlas rivalry card with you/them records + position depth bars.

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

## 2026-05-31 — Workday cycle 1 (Lab OG export parity)

1. **Export must live on the panel** — users screenshot from the tool they are in; buried OG routes without an "export card" link do not travel.
2. **Gamelog / efficiency / aging** are tape-and-window panels — same footer pattern as weekly heatmap closes launch-10 export parity (atom 1/3).
3. Standing: sample preview on OG when API empty — T1 trust.

## 2026-05-31 — Factory cycle 1 (Company OS)

1. **Position-grade roster screenshots** still win trade threads — A–F grid + thinnest-spot callout beats prose rankings.
2. **Hawkeye on Self-Scout OG** matches in-product agent ownership; keeps Bureau-7 hallway consistent.
3. Standing pattern: sample preview on OG when Sleeper not linked — protects trust (T1).

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

## 2026-05-23 — Cycle 43

### r/DynastyFF — leaguemate psychology / panic seller screenshots (pattern; live fetch 403)
- **Pattern:** Trade advice threads name **specific managers** — "Dave panic-sells after back-to-back losses", "Kevin never trades" — more than generic rankings. Group chats screenshot manager dossiers when negotiating deals.
- **Competitor framing:** Footballguys "Know Your Leaguemates" articles (2018–2024) — manual observation, zero automation. leaguemate.fyi does history not psychology.
- **Razzle gap:** Bureau had build profiles (roster archetype) and waiver tendencies but no manager behavioral tags with exploit windows.
- **Slice:** League L3 `manager-profiles` — Bones header, PANIC SELLER/HOARDER/AGGRESSIVE cards, exploit-window copy, Room ask on hero manager.
- **Council cycle:** 43
- **Bot-fact potential:** `!razzle confirm <manager> panic score` — future intel layer

## 2026-05-23 — Cycle 47

### r/DynastyFF — league-specific trade matcher vs generic value charts (pattern; live fetch 403)
- **Pattern:** Trade advice threads ask "who in my league would take X for Y?" — not "what's his KTC value." Comment chains want **roster-aware** suggestions: surplus WR for need at RB, matched to a specific leaguemate before the deadline.
- **Competitor framing:** KeepTradeCut/FantasyCalc are league-agnostic. leaguemate.fyi shows history not fair-value pairs. Dynasty managers screenshot **named player-for-player offers** when negotiating in group chats.
- **Razzle gap:** Cycles 45–46 shipped pressure map + trade network; no value-matched trade suggestions from connected Sleeper rosters.
- **Slice:** League L4 `trade-finder` — Bones header, dynasty_value matching within 25% gap, position need/surplus, Room ask on hero deal, hallway to pressure-map + trade-network + /lab/trade-values.
- **Council cycle:** 47
- **Bot-fact potential:** `!razzle <A> for <B> in <league>` — future intel layer

- **Pattern:** Pre-deadline threads ask **"who's desperate in your league?"** — managers with losing records get targeted for win-now pieces. Comment chains share horizontal bar charts ranking leaguemates by desperation, not just W-L standings.
- **Competitor framing:** Legacy Razzle V1 pressure map (league-intel.html) — top-3 free, full map Pro. Footballguys deadline articles name archetypes but no live league scoring.
- **Razzle gap:** Cycle 43 shipped manager archetypes; no standalone desperation score visualization for deadline timing.
- **Slice:** League L4 `pressure-map` — Bones header, 0–100 desperation bars (desperate/motivated/comfortable), Room ask on hero manager, hallway to manager-profiles + trade-network.
- **Council cycle:** 45
- **Bot-fact potential:** `!razzle confirm <manager> deadline pressure` — future intel layer

## 2026-05-23 — Cycle 49

### r/DynastyFF — film room / staff personality vs generic chat (pattern; live fetch 403)
- **Pattern:** Dynasty managers distrust "AI assistant" posts but upvote **personality-driven tools** — named analysts, war-room framing, league-aware follow-ups. Comment chains ask "what would your scout say about MY roster?" not "what's the model think?"
- **Competitor gap:** KeepTradeCut/FantasyCalc are charts. ChatGPT wrappers get downvoted. No competitor ships six named pixel staff on a war table with league context in prompts.
- **Razzle slice:** Room L3 — restore pixel canvas with all six sprites (board DELETE hid costumed 3-agent rebind). Click Dolphin → Dolphin walks. Pending ask → WORK state on selected agent.
- **Council cycle:** 49
- **Screenshot potential:** `/room` pixel floor with six staff + briefing card — brand differentiation post for r/DynastyFF

## 2026-05-23 — Cycle 51

### r/DynastyFF — leaguemate rivalry / H2H dossier screenshots (pattern; live fetch 403)
- **Pattern:** Dynasty group chats and trade threads name **specific rivals** — "I'm 2-0 vs Dave all-time", "Kevin hoards RBs, I need WR depth." Comment chains want side-by-side roster compare, not league-agnostic value charts. Pre-playoff threads ask "who do I want in the bracket?"
- **Competitor framing:** Legacy V1 H2H tab (league-intel.html) had manager picker + position bars + trade-fit lanes. KeepTradeCut/FantasyCalc have zero league context. leaguemate.fyi shows transaction history not live depth matchup.
- **Razzle gap:** API `head_to_head` existed since V2 scaffold but tab hidden in `HIDDEN_BUREAU_SLUGS`; ACCEPTANCE Gate 3 listed H2H as stub.
- **Slice:** League L5 — Head-to-Head opponent picker + Atlas rivalry renderer, hallway to Trade Finder + Room ask.
- **Council cycle:** 51
- **Screenshot potential:** You vs rival dual cards + position depth bars — group-chat droppable before playoffs
- **Bot-fact potential:** `!razzle h2h <you> vs <rival>` — future intel layer

## 2026-05-23 — Cycle 53

### r/DynastyFF — earned staff discovery vs AI wrapper rejection (pattern; live fetch 403)
- **Pattern:** Dynasty managers downvote "AI assistant" promos but upvote **personality-driven tools** — named analysts, war-room framing, league-aware one-liners. Comment chains ask "what would your scout say about MY roster?" not "what does the model think?"
- **Competitor gap:** KeepTradeCut/FantasyCalc are charts. ChatGPT wrappers get mod scrutiny. No competitor ships six named staff nudging Lab → Bureau → Room with typed hallway links.
- **Razzle gap:** Legacy V1 `agent-nudges.js` (Elite, max 5/session) never ported to V2 Next.js stack. Design doc Week 5 journey ("Hawkeye: 2 bench players trending") blocked.
- **Slice:** Room L5 — Elite proactive nudges on Lab + Bureau via `AgentNudgeBar`, hallway routes to Self-Scout, Trade Finder, H2H, Room ask.
- **Council cycle:** 53
- **Screenshot potential:** Pill nudge with staff avatar + cross-room link — Pro/Elite conversion post without AI cringe

## 2026-05-23 — Cycle 55

### r/DynastyFF — filtered screener screenshot posts (pattern; live fetch 403)
- **Pattern:** Dynasty OC posts share **filtered screener views** — "top 6 RBs by PPR FPTS", "my Target Hog composite sorted WRs" — with position-colored rows. Comment chains ask for the tool link, not generic rankings sites. Users manually OS-screenshot spreadsheets when tools lack one-click export.
- **Competitor framing:** DynastyProcess articles, KeepTradeCut tiers — static tables. FFDataPros/Dynasty FF Dashboard require manual screenshot. No competitor ships filter-aware share cards with watermark from the screener itself.
- **Razzle gap:** Cycle 4 shipped `/og/explore` branding-only card (no player rows). Board cycle 54 deferred live-data export to cycle 55+ (Gemini PRIORITY-MISS #3 — north-star growth loop).
- **Slice:** Explore L5 — `/og/explore` fetches top 6 rows from screener API for current filter/sort; position pills; `made with 🐯 razzle.lol` watermark; `ExploreShareButton` passes `dir` param.
- **Council cycle:** 55
- **Screenshot potential:** RB-only FPTS card droppable in r/DynastyFF trade/value threads — data-first, not SaaS promo
- **Bot-fact potential:** `!razzle confirm top RB PPR FPTS` — future intel layer

## 2026-05-31 — Cycle 58

### r/DynastyFF — panel OG cards need rows, not loading shells (pattern)
- **Pattern:** Users share **data-dense** tool screenshots. A panel title + "pulling film..." reads as a broken export, not a teaser.
- **Razzle gap:** Cycle 57 live fetch works with `terminal.db`; CI and cold OG previews still empty. H2H solved with labeled sample rivalry rows.
- **Slice:** Lab L5 — `/og/[panel]` demo player rows + "sample preview" when API empty.
- **Council cycle:** 58
- **Screenshot potential:** Dynasty rankings / breakout cards droppable in threads even before API sync on preview hosts

## 2026-05-31 — Cycle 61 (workday cycle 1)

1. **Deadline pressure screenshots travel.** Trade threads share "who's desperate" bar charts before deadline — Pressure Map OG completes Bureau export parity with H2H/MC/Trade Finder.
2. **Bones owns trade-deadline intel** — OG card shows Bones badge + desperation labels (desperate/motivated/comfortable) matching in-product Bureau tab.

## 2026-05-31 — Cycle 62 (workday cycle 2)

1. **Manager archetype labels are trade-DM shorthand** — PANIC SELLER / HOARDER badges travel faster than transaction counts in group chats.
2. **Bureau OG series compounds** — Pressure Map + Manager Profiles give two screenshot hooks before trade-network atom.

## 2026-05-31 — Cycle 63 (factory reopen cycle 1)

1. **Trade partnership lanes are collusion bait** — "these two trade every week" screenshots spark DM threads; OG card must show partner pairs + trade counts, not a graph stub.
2. **Bones trade-network OG closes atom 3/4** — Bureau export trilogy (pressure, managers, network) now screenshot-ready for deadline season.

## 2026-05-31 — Cycle 69 (workday cycle 1 — 1299)

1. **Breakout cards must show names users recognize** — `candidates` extraction on OG `/og/breakouts` aligns share cards with Hawkeye's in-panel list when API data exists.
2. **Same API path as Lab** — `/api/panels/{slug}` prevents OG drift from tier/breakout response shapes.

## 2026-05-31 — Cycle 59

### r/DynastyFF — panel-specific stat labels on share cards (pattern)
- **Pattern:** Users screenshot **tool-specific** views — weekly FPTS grids, prospect scores, aging curves — and comment using that vocabulary. Generic "Value" columns on a heatmap card read as lazy export.
- **Razzle slice:** Lab L5 atom 2 — launch-10 OG demo rows with FPTS/Score/Rank/Peak Age/Chg stat headers per panel slug.
- **Council cycle:** 59
- **Screenshot potential:** Weekly heatmap + prospect big board cards now match in-product column semantics on preview hosts
