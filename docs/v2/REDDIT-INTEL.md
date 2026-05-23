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
