# Razzle — Progress Tracker

## Current Phase: Phase 17 — College Production Stats (cfbfastR) (COMPLETE)

**Exit criterion MET:** College production stats from sportsdataverse play-level CSVs aggregated into per-player per-season totals in terminal.db (19,454 player-season rows, 9,875 unique players, 2020-2025). College stats API endpoints serve player data with search/filter/sort (GET /api/college/players, /api/college/player-profile/{id}, /api/college/filter-options). Lab has three-way universe toggle (NFL/Prospects/College) with 30 college-specific columns, 3 presets (Production/Efficiency/Draft Profile), blue accent. College player profiles clickable with position-specific headlines, season log, combine/measurables, NFL career cross-reference. URL state: ?u=college&season=2024. Follows Razzle design system. Deployed to Render.

### Phase 17 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | cfbfastR adapter — play-level CSV aggregation | DONE | adapters/cfbfastr_adapter.py fetches play-level CSVs from sportsdataverse GitHub (2020-2025), aggregates into per-player per-season totals. 19,454 player-season rows, 9,875 unique players. Passing, rushing, receiving stats with correct TD attribution (handles both QB-credited and receiver-credited patterns). Position inferred from stats, refined via combine/draft data (918 refinements). Bootstrap in server.py + render.yaml updated. |
| 2 | College stats API endpoints | DONE | GET /api/college/players (paginated, search/position/team/conference/season/sort with derived sorts), GET /api/college/player-profile/{id} (all seasons + career totals + combine/draft), GET /api/college/filter-options (6 seasons, 330 teams, 50 conferences). Derived efficiency stats: CMP%, YPC, Y/REC, catch_rate, per-game avgs. Python re-sort for derived metrics. |
| 3 | College mode in Lab screener | DONE | Three-way universe toggle (NFL/Prospects/College). 30 college columns (Production/Usage/Efficiency/Per Game). 3 presets (Production, Efficiency, Draft Profile). Blue accent mode. College player profiles with position-specific headlines, season log, combine, NFL career data. URL state ?u=college&season=2024. Season selector 2020-2025. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. All Python imports clean. All frontend assets present. render.yaml correct (cfbfastr 2020-2025 at build). Smoke tests pass: 3887 college players, sort/filter/profiles work, combine cross-reference. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 16 — Draft Class Analytics + Cross-Year Comparison (COMPLETE)

**Exit criterion MET:** Lab prospect mode has "Class Analytics" button that opens draft class comparison view. Shows year-over-year analysis for each position (2020-2026): average RPS, tier distribution (Elite/Premium/Solid/Flier counts), class grade badge (A/B/C/D based on avg RPS + elite/premium ratio), top prospect per year. Canvas-rendered bar chart of avg RPS by year with grade-colored bars. Class cards grid with tier distribution bars, prospect counts, top prospect info. Position filter tabs (ALL/QB/RB/WR/TE). Exportable as PNG with Razzle watermark (800px wide portrait). Follows Razzle design system. Deployed to Render.

### Phase 16 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Draft class analytics API endpoint | DONE | GET /api/draft-class-analytics?position=WR. Reuses fetch_prospect_scores per year, computes avg RPS, tier distribution, class grade (A/B/C/D based on avg RPS + elite/premium ratio), top prospect. Covers 2020-2026 draft classes. Works for all positions and ALL. |
| 2 | Draft class analytics view in Lab frontend | DONE | "Class Analytics" button in prospect toolbar. Overlay with position filter tabs, canvas bar chart (grade-colored bars, gridlines, labels), class cards grid (grade badge, stats, tier distribution bar, top prospect). Razzle design: chunky 3px borders, offset shadows, sand bg, Caveat annotations. Mobile responsive grid. |
| 3 | Draft class analytics PNG export + deploy | DONE | Canvas-rendered export: title, bar chart with grade badges, class cards with tier bars. Portrait 800px layout. Razzle watermark. Downloads as razzle-class-analytics-{position}.png. All JS syntax passes. Python imports clean. Pushed to master. |

## Previous Phase: Phase 15 — Unified Prospect Report Cards (COMPLETE)

**Exit criterion MET:** Click any prospect name in Lab → profile card shows RPS score bar with tier badge (Elite/Premium/Solid/Flier), component breakdown (Athletic 60% / Draft Cap 30% / Size 10%), athletic percentile bars, spider chart, NFL athletic comps with comp-based stat projections (weighted average of comp NFL careers by similarity), confidence indicator. Enhanced PNG export captures full report card with all sections. Follows Razzle design system. Deployed to Render.

### Phase 15 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | RPS score + tier badge in prospect profile | DONE | Client-side RPS computation from profile percentiles (same formula as backend). RPS score bar colored by tier, rotated tier sticker badge, component breakdown boxes (Athletic/Draft Cap/Size) with dashed borders. Chunky 3px card border with offset shadow. |
| 2 | Comp-based stat projections | DONE | computeCompProjection() computes weighted average of comp NFL careers by similarity %. Position-specific stats (QB: pass, RB: rush+rec, WR/TE: rec). Confidence indicator based on average comp similarity. Caveat annotation. Only shows when comps have NFL data. |
| 3 | Enhanced prospect report card PNG export | DONE | Canvas-rendered export now includes: header, measurables, RPS section (score bar + tier badge + component breakdown), athletic testing bars, spider chart, comp cards (similarity badge + name + stats), projection boxes. Portrait layout (800px wide). Razzle watermark baked in. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. All HTML pages + assets present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 14 — Composite Prospect Scoring + Big Board (COMPLETE)

**Exit criterion MET:** Lab prospect mode has "Big Board" button that opens visual ranked board scored by Razzle Prospect Score (RPS). RPS = weighted composite of avg athletic percentile (60%) + draft capital value (30%) + position-relative size score (10%). Big Board shows ranked prospects with position filter tabs (ALL/QB/RB/WR/TE), tier bands (Elite 85+/Premium 70-85/Solid 55-70/Flier <55) with rotated sticker badges, ranked prospect cards with RPS score bars, key combine metrics, draft info. Exportable as PNG with Razzle watermark. 329 total prospects scored for 2025 draft class. Follows Razzle design system. Deployed to Render.

### Phase 14 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Razzle Prospect Score (RPS) backend | DONE | New endpoint GET /api/prospect-scores. RPS formula: athletic_avg*0.6 + draft_capital*0.3 + size_score*0.1. Draft capital: pick 1=100, linear decay to pick 256=20, undrafted=20. Size score: position-relative weight percentile. Handles missing combine data gracefully. 329 prospects scored for 2025. |
| 2 | Big Board view in Lab frontend | DONE | "Big Board" button in prospect toolbar. Overlay with position filter tabs (ALL/QB/RB/WR/TE), tier bands (Elite/Premium/Solid/Flier) with rotated sticker badges. Ranked prospect cards: rank circle, name, position chip, school, draft info, RPS bar with tier color, key metrics. Chunky 2px borders, offset shadows, hover lift. Mobile responsive. |
| 3 | Big Board PNG export | DONE | Canvas-rendered export with title, tier sections, prospect rows with RPS bars, position chips, combine metrics. Portrait layout (800px wide). Razzle watermark baked in. Downloads as razzle-bigboard-{position}-{year}.png. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. RPS endpoint returns correct data for all positions. Render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 13 — Historical Athletic Comps + Prospect Comparisons (COMPLETE)

**Exit criterion MET:** Prospect profile cards show top 3 NFL historical athletic comps (players with most similar combine profiles at same position, Euclidean distance on percentile-normalized metrics, NFL career boost). Prospect comparison mode: select 2-3 prospects → side-by-side spider chart overlays with different colors + combine stat table with percentiles. Draft class tier view: "Tiers" button in prospect toolbar, position selector, prospects grouped by avg athletic percentile (Elite 80+, Above Avg, Avg, Below Avg, No Data) with sticker badge tier labels. All exportable as PNG with Razzle watermark. Follows Razzle design system. Deployed to Render.

### Phase 13 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Historical athletic comps API + UI | DONE | Backend: /api/prospect-comps endpoint. Euclidean distance on percentile-normalized combine metrics (40, bench, vert, broad, cone, shuttle). NFL career boost in sorting. Frontend: "NFL Athletic Comps" section in prospect profile card with top 3 comp cards showing similarity %, draft info, career stats. Chunky borders, offset shadows, colored similarity badges. Mobile responsive. |
| 2 | Prospect comparison mode | DONE | Backend: /api/prospects/compare returns multiple prospects with percentiles. Frontend: prospect checkboxes work in Lab, Compare button opens overlay with side-by-side spider chart (2-3 prospects, different colors) + combine stat comparison table with percentiles. Best values highlighted green. PNG export with watermark. Mobile responsive. |
| 3 | Draft class position tier view | DONE | Backend: /api/prospect-tiers returns prospects grouped by avg athletic percentile tier (Elite 80+, Above Avg 60-80, Avg 40-60, Below Avg <40, No Data). Frontend: "Tiers" button in prospect mode toolbar, position selector (QB/RB/WR/TE), tier grid with sticker badges, prospect cards with avg percentile + key metrics. PNG export with watermark. Responsive grid layout. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. All Python imports clean. All HTML pages + assets present. render.yaml correct. All 3 new endpoints (prospect-comps, prospects/compare, prospect-tiers) return correct data. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 12 — Prospect Cards + Athletic Percentiles (COMPLETE)

**Exit criterion MET:** Click any prospect name in Lab prospect mode → rich profile card opens with blue prospect accent header, PROSPECT badge, combine metrics as percentile bars (color-coded by position-group rank: red→orange→yellow→teal→green), athletic spider chart (canvas radar with percentile axes), measurables bar, draft capital, NFL career stats (if available). Prospect cards exportable as PNG with Razzle watermark. Follows Razzle design system (chunky borders, offset shadows, sand bg, Space Mono data, Caveat annotations). Mobile responsive. Deployed to Render.

### Phase 12 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Prospect profile cards | DONE | Click prospect name → rich modal with blue prospect accent header, PROSPECT badge, school + draft info, combine metrics, measurables bar, NFL career stats (if any). Export PNG with watermark. Backend: /api/prospect-profile endpoint with position-group percentile computation. Mobile responsive. |
| 2 | Athletic percentile bars | DONE | Each combine metric (40, bench, vert, broad, cone, shuttle) rendered as horizontal percentile bar. Percentile computed against all same-position prospects in DB. Color gradient: red (0-20) → orange → yellow → teal → green (80-100). Inverted for time metrics (lower = better). Space Mono numbers, chunky bar styling. |
| 3 | Prospect combine spider chart | DONE | Canvas-rendered radar chart showing combine percentiles on 0-100 scale. Blue fill (prospect accent), grid rings at 20/40/60/80/100, axis lines, percentile-colored labels. Handles missing metrics by filtering axes. Caveat title annotation. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python server imports clean. All HTML pages, JS files, CSS, sprites present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 11 — Positional Heat Maps + Breakout Detection (COMPLETE)

**Exit criterion MET:** Lab has a Heat Map tab in the chart panel: select position (QB/RB/WR/TE) → see top 15/20/30 players × stats grid with cells colored by percentile rank (red→yellow→green). 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency). Exportable as PNG with Razzle watermark. Breakout detection: backend computes 50%+ YoY PPR increase, BRK% column in screener with green pill badges, breakout badge in player profile (sticker aesthetic). All follows Razzle design system. Deployed to Render.

### Phase 11 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Positional heat map visualization | DONE | Heat Map tab in chart panel. Position selector (QB/RB/WR/TE), 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency), configurable top 15/20/30. Canvas-rendered grid with percentile-colored cells (red→yellow→green). Player names + team badges on Y-axis, rotated stat headers on X-axis. Razzle design: chunky borders, sand bg, Luckiest Guy/Space Mono/Caveat fonts, watermark. Horizontal scroll on mobile. |
| 2 | Heat map PNG export | DONE | "Export PNG" button visible only in heat map tab. Downloads canvas as razzle-heatmap-{position}.png. Watermark already baked into canvas render. |
| 3 | Breakout detection badges | DONE | Backend _enrich_with_breakout() computes max YoY PPR increase (20-point threshold). breakout_pct field in API. BRK% column in screener (Breakout group, in Dynasty preset). Green pill badge with +N% in screener cells >=50%. Breakout badge in player profile (sticker: rotated, green, chunky border). |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python imports clean. All HTML pages, JS files, CSS, sprites present. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 10 — Player Profiles + Lab Enhancement (COMPLETE)

**Exit criterion MET:** Click any player name in the Lab screener → rich profile modal opens with position-colored header, career headline stats bar (position-specific), season-by-season breakdown table with career totals, combine/draft data grid (if available), and career arc canvas chart. Profile PNG export with Razzle watermark. Mobile responsive. Follows Razzle design system (chunky borders, offset shadows, position colors, sand bg).

### Phase 10 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Player profile detail modal | DONE | Click player name → profile modal with position-colored header, career headline stats bar (position-specific), season-by-season table with career totals, combine/draft data grid, career arc chart. Razzle design system: chunky borders, offset shadows, position colors. Close on click-outside. Mobile responsive. |
| 2 | Profile career arc chart | DONE | Canvas chart in profile: PPR per season line with filled area, position-colored, data point dots with value labels, Y-axis gridlines, season tick labels. Handles single-season players. |
| 3 | Profile image export | DONE | "Export PNG" button in profile header. Canvas-rendered profile (header, stats bar, season table) with Razzle watermark. Downloads as razzle-profile-{name}.png. |
| 4 | Deploy + smoke test | DONE | All JS passes syntax check. Python server imports clean. All HTML pages, JS files, CSS, sprites present. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 9 — Polish + Formula Store (COMPLETE)

**Exit criterion MET:** Complete product loop works: land on home → explore Lab → create formula → publish to store → connect Sleeper → enter War Room → run agent scenario → see league-contextualized brief. Formula Store has 10 seed community formulas with search/filter/sort, publishing flow, ratings/reviews. Custom 404 page. All pages have loading/error/empty states. Performance verified (pagination, 60fps canvas, indexed DB). Everything works, design is cohesive.

### Phase 9 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula Store UI | DONE | Store overlay with 10 seed community formulas, search/filter by position, sort by popular/rating/newest, formula cards with chunky borders + offset shadows, install/uninstall, star ratings, stat preview (weights hidden), creator names. Mobile responsive. |
| 2 | Formula publishing | DONE | "Publish" button on each saved formula in formula builder. Publish modal with name, creator name, description, position tag checkboxes. Published formulas saved to razzle_store_published localStorage and appear in store. Weights hidden (stat names only). "Published" badge shows on already-published formulas. |
| 3 | Formula ratings/reviews | DONE | Clickable 1-5 star rating on each store card with hover preview. Review text input appears after rating. Reviews persist in razzle_store_reviews localStorage. Sort by popular/top rated/newest. User review displayed on card after submission. |
| 4 | Full UX polish pass | DONE | Custom 404 page with Razzle branding (tiger mascot, "checked the film" copy, navigation links). Server-side 404 handler for non-API routes. Shared .error-msg and .empty-msg CSS classes. All pages already have loading/error/empty states with Razzle personality ("pulling film...", "fumbled the data fetch..."). All pages mobile responsive. |
| 5 | Performance audit | DONE | Screener pagination verified (100/page, SQL LIMIT/OFFSET). Canvas game loop uses requestAnimationFrame with delta time capping (60fps). Database indexes on search_name, position, team, player_id, season, fantasy_points_ppr. API caps results at 1000. No memory leaks or unbounded arrays. System well-optimized for target scale. |
| 6 | Deploy + smoke test | DONE | All JS files pass syntax check. All Python modules import cleanly. All HTML pages present. All assets (sprites, personas, favicon) verified. render.yaml correct. Pushed to master for Render auto-deploy. |

## Previous Phase: Phase 8 — War Room: Context Bridge + Free/Paid Gating (COMPLETE)

**Exit criterion MET:** Free user asks a question → gets generic agent analysis (Generic Mode badge, no league context in prompts). Connected Sleeper user asks the same question → gets league-contextualized answer that references their roster and rivals (League Context Mode badge, roster/rivals/record in prompts, rules instruct personalized analysis). Pro upsell card with blurred preview for non-connected users. Home page demo has 55 briefings with agent bio cards showing pixel avatars.

### Phase 8 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Lab context feed | DONE | Lab saves selected players + stats + formulas to localStorage (razzle_lab_context). War Room reads via getLabContext(), injects "What The Lab Knows" section into agent prompts. Context badges in scenario panel show active/inactive state for Lab and Sleeper. |
| 2 | League Intel context feed | DONE | League-intel.html saves league metadata (name, type, scoring, teams) on loadLeagues() and roster + rivals on toggleLeague() to razzle_league_context localStorage. War Room reads via getLeagueContext(), formats with record, roster, top 5 rival managers + their top players. Disconnect clears context. 7-day TTL. |
| 3 | Free vs. paid prompt tiers | DONE | Automatic mode detection via isLeagueContextMode(). Free/generic mode: no league context, rules instruct general analysis. League context mode: rules instruct roster-specific, rival-aware analysis. Mode badge in scenario panel shows current state. |
| 4 | Paywall UI gating | DONE | Pro upsell card with blurred/redacted league context preview. Visible only in generic mode (no Sleeper). "Connect Sleeper to Unlock" CTA links to league-intel. Hidden when league context available. Razzle design system: chunky orange border, offset shadow, handwritten text, blurred preview lines. |
| 5 | Home page War Room demo upgrade | DONE | 55 briefings (up from 33): Razzle 11, Scout 11, Diplomat 9, Quant 8, Medical 8, Historian 8. New content covers bye week alerts, playoff clinch scenarios, trade vetoes, coaching changes, injury sell-highs, FAAB budget strategy, historical comps. Rotation picks 3 from different agents. |
| 6 | Agent bio cards | DONE | 6 bio cards on landing page ("Meet the Team" grid) and War Room hero. Pixel avatars from sprite sheets (background-position into 112x96 PNGs). Position-colored stripes, agent names, roles, specialty one-liners. Razzle design: 3px borders, offset shadows, slight rotation, hover lift. Mobile responsive (3→2 cols at 768px). |

## Previous Phase: Phase 7 — War Room: Agent Personas + Scenario Runner (COMPLETE)

**Exit criterion MET:** User types scenario → 5 specialists respond in parallel with per-agent status tracking → Razzle synthesizes with peer insights → briefing cards render with structured analysis (Razzle at top, specialists collapsible below). Urgency badges, markdown rendering, error states. Works with any OpenRouter-compatible API key.

### Phase 7 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Agent persona files | DONE | 6 markdown files in agent-personas/: razzle.md (Chief of Staff), medical.md, scout.md, diplomat.md, quant.md, historian.md. Adapted from FDL personas with Razzle brand voice, mandatory output sections per roadmap spec |
| 2 | Agent config panel | DONE | Config toggle + sand-bg overlay panel in War Room dark zone. Shared API key with "Apply to All", model selector (default openrouter/auto), base URL, per-agent key overrides with color dots. localStorage persistence via razzle_agent_config key. Razzle design system: chunky borders, offset shadows, font-display labels, font-mono inputs, font-hand hints |
| 3 | Scenario input panel | DONE | Sand-bg card in dark zone below canvas. Textarea with Caveat placeholder, 6 pre-loaded example scenario chips, "Run All Agents" primary button + per-agent run buttons with color dots. Loading states ("pulling film..."). Custom events dispatched for LLM integration (Task 4). Mobile responsive. |
| 4 | LLM integration | DONE | Browser-side fetch to OpenRouter-compatible API. loadPersona() fetches persona markdown from /agent-personas/. callLLM() with 20s AbortController timeout, temperature 0.3. Error handling for missing key, timeout, bad response. executeAgent() composes persona + rules + scenario into system/user messages. runAllAgents() runs 5 specialists in parallel via Promise.all, then Razzle synthesizes with peer insights. Custom events dispatched for rendering. |
| 5 | Specialist agent execution | DONE | 5 specialists fire in parallel via Promise.all. Per-agent status tracker chips (running/done/error) with colored indicators. Individual try/catch per agent — one failing doesn't block others. Canvas bubbles + UI status chips update in real-time. |
| 6 | Razzle orchestration | DONE | Already implemented in runAllAgents(): await Promise.all for 5 specialists, then Razzle runs with peerInsights from successful results. razzle.md persona defines Urgency Tier, Conflicts and Resolution, GM Decision Needed sections. buildRules() adds synthesis-specific rules. Edge cases: all fail (early return), partial failures, missing key, LLM error. |
| 7 | Response rendering | DONE | Briefing cards render in War Room dark zone via razzle:all-agents-done and razzle:agent-result event listeners. Razzle card at top (prominent, orange accent border, expanded). Specialist cards below (collapsible, start collapsed). Simple markdown→HTML renderer for agent responses. Urgency badge detection (URGENT/MONITOR/OPPORTUNITY) on Razzle card. Error states per card. CSS: chunky 3px borders, offset shadows, font-display headings, font-mono data, position-colored dots. Mobile responsive. |

## Previous Phase: Phase 6 — War Room: Pixel Engine + Agent Canvas (COMPLETE)

### Phase 6 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | agents.html page | DONE | War Room hero (sand bg, Luckiest Guy, agent badges), dark mode canvas zone, nav on all pages |
| 2 | Pixel agent sprite sheets | DONE | 6 character PNGs (112×96, 7×4 grid of 16×24 frames) ported from FDL to frontend/assets/characters/ |
| 3 | Canvas War Room engine | DONE | 30×22 tile grid, wood floor, turf war table, 6 desks, collision map. warroom.js (full canvas engine) |
| 4 | Agent AI + animation | DONE | State machine (IDLE/WALK/WORK/THINK/DISCUSS/COFFEE/CELEBRATE), walk frames [0,1,2,1] at 150ms, directional facing |
| 5 | Agent selection + camera | DONE | Click select (dashed ellipse), camera follow, arrow key controls, name tags with role colors |
| 6 | Agent roster sidebar | DONE | Toggleable panel: pixel avatars, names, roles, live activity status, click to select + camera follow |

**Exit criterion MET:** agents.html loads with live pixel War Room. 6 agents walk around autonomously, work at desks, visit war table. Click to select, camera follows, roster sidebar. Room has Razzle comic-strip aesthetic with draft board, TVs, whiteboard, trophy case.

---

## Previous Phase: Pre-Draft Enhancement

### Pre-Draft Enhancement Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Multi-season NFL data (2020-2024) | DONE | 1238 players, 28026 stat rows across 5 seasons. Career aggregates enabled. |
| 2 | Career view in Lab | DONE | Season selector includes "Career" option, aggregates all seasons. Dynasty preset includes seasons column. |
| 3 | Bootstrap on startup | DONE | server.py lifespan bootstrap syncs data if DB empty (Render cold start resilience) |
| 4 | render.yaml multi-season | DONE | Build command syncs 2020-2024 seasons |
| 5 | Advanced metrics | DONE | target_share, air_yards_share, WOPR, RACR, EPA (pass/rec/rush), DAKOTA from nflverse rate stats |
| 6 | Efficiency columns | DONE | Y/CAR, Y/REC, Y/TGT, Catch%, CMP%, Y/ATT derived from aggregates |
| 7 | Per-game averages | DONE | REC/G, TGT/G, RuYPG, ReYPG, PaYPG computed per player |
| 8 | New presets | DONE | Efficiency + Advanced presets added to Lab toolbar |
| 9 | Season trend charts | DONE | Weekly + By Season toggle in trend chart, /api/players/{id}/seasons endpoint |
| 10 | Filter safeguards | DONE | Derived/rate metrics excluded from HAVING clause and filter dropdown |

---

### Pre-Launch Polish (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | War Room demo rotation | DONE | 33 briefings across 6 agent types (Razzle, Scout, Diplomat, Quant, Medical, Historian), shuffle on each visit, "shuffle briefings" button |
| 2 | Mobile responsiveness | DONE | Media queries at 768px and 480px breakpoints for all pages (landing, Lab, League Intel) |
| 3 | Design audit | DONE | Replaced raw hex colors in demo section with CSS variables, added SVG favicon |
| 4 | Deploy to Render | DONE | Pushed to master, Render auto-deploys |

**Exit criterion MET:** All pages responsive on mobile, War Room demo rotates per visit, design consistent with DESIGN.md, deployed to Render.

---

## Previous Phases

### Phase 1b — College/Prospect Data (COMPLETE)

### Phase 1b Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | College adapter | DONE | adapters/college_adapter.py — fetches combine.csv + draft_picks.csv from nflverse |
| 2 | Combine data | DONE | 2413 entries (2020-2026), 40-yard, bench, vertical, broad jump, cone, shuttle |
| 3 | Draft picks data | DONE | 1549 picks (2020-2025), draft capital + career NFL stats |
| 4 | Prospect API | DONE | GET /api/prospects with sort/filter/search, GET /api/prospect-options |
| 5 | NFL/Prospect toggle | DONE | Universe toggle in Lab toolbar, blue accent for prospect mode |
| 6 | Prospect column presets | DONE | Combine, Athletic, Draft Capital, NFL Production presets |
| 7 | URL state for prospects | DONE | ?u=prospects&draft_year=2025 — full state serialization |

**Exit criterion MET:** Toggle to Prospects, see 2025 draft class sorted by pick, filter by position, sort by 40-yard dash.

---

## Previous Phases

### Phase 4 — Landing Page + Sleeper Connection (COMPLETE)

### Pre-Launch Polish (COMPLETE)

### Phase 0 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project structure | DONE | /frontend, /backend, /adapters, /data, /scripts created |
| 2 | nflverse adapter | DONE | Fetches weekly CSVs from GitHub, 612 players, 5597 stat rows, 40+ metrics |
| 3 | Serving layer (FastAPI) | DONE | /api/health, /api/players, /api/screener/query, /api/filter-options |
| 4 | Local dev confirmed | DONE | Frontend + API serving from single FastAPI app |
| 5 | Deploy to Render | READY | render.yaml updated for Python web service, needs push |

**Exit criterion MET:** Browser hits API, returns real 2024 NFL player stats from SQLite.

---

### Phase 1 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Screener table UI | DONE | Sortable columns, sticky player name, position badges, horizontal scroll |
| 2 | Advanced filtering | DONE | Modal: pick stat + operator + value, filter tags with remove, AND logic |
| 3 | Column picker | DONE | Slide-out panel, grouped by category, checkbox toggles |
| 4 | Season/week selector | DONE | Season dropdown from API. Week-level breakdown deferred to Phase 1b |
| 5 | Relevance tier toggle | DONE | "Fantasy Only" vs "All Players" button |
| 6 | Search + URL state | DONE | Full state serialization (pos, search, sort, filters, columns, pagination) |
| 7 | NFL/NCAA toggle | DEFERRED | Requires college_adapter.py — will build in Phase 1b or Phase 2 |

**Exit criterion MET.**

---

### Phase 2 Tasks (COMPLETE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula builder UI | DONE | Modal: stat dropdowns + weight percentage + name, save/delete |
| 2 | Formula persistence | DONE | localStorage, formulas register as sortable COLUMNS in screener |
| 3 | Radar charts | DONE | Canvas API, 6-stat polygon, two-player overlay, configurable stats |
| 4 | Scatter plots | DONE | Any stat × any stat, position-colored dots, labeled players |
| 5 | Trend charts | DONE | Week-by-week line chart via /api/players/{id}/weeks endpoint |
| 6 | Comparison mode | DONE | Checkbox select → side-by-side table + radar overlay |

**Exit criterion MET:** Create a custom WR formula, sort screener by it, open radar chart comparing two players.

---

## Completed Work

### Pre-Phase 0 (Design & Planning)
- [x] Brand name chosen: Razzle
- [x] Domain bought: razzle.lol (Namecheap)
- [x] Mascot designed: Bengal tiger, Chief of Staff
- [x] Theme prototype built: index.html (Anthropic sand, Garfield font, chunky borders)
- [x] Design guide written: docs/DESIGN.md
- [x] Roadmap written: docs/ROADMAP.md
- [x] GitHub repo created: swaggerdagger987/razzle (private)
- [x] Render static site connected (landing page deploying)
- [x] Custom domain DNS configured (pending SSL cert)

### Phase 0 — Foundation
- [x] Project folder structure: /frontend, /backend, /adapters, /data, /scripts
- [x] nflverse adapter: adapters/nflverse_adapter.py — fetches player_stats CSVs, normalizes to SQLite
- [x] Database schema: players, player_week_stats, player_week_metrics, sync_state tables
- [x] FastAPI server: backend/server.py + backend/live_data.py
- [x] API endpoints: /api/health, /api/players, /api/screener/query, /api/filter-options
- [x] Data verified: 612 players, 2024 season, top scorers match real NFL data
- [x] render.yaml updated for Python web service with build-time data sync

### Phase 1 — The Lab: Core Screener
- [x] lab.html: Full screener page with toolbar, filter bar, data table, footer
- [x] lab.js: Screener state management, API integration, rendering
- [x] styles.css: Shared stylesheet with Razzle design system
- [x] app.js: Shared utilities (API fetch, formatting)
- [x] 5 column presets: PPR, Passing, Rushing, Receiving, Dynasty
- [x] 20 sortable columns across Fantasy, Passing, Rushing, Receiving, Totals groups
- [x] Advanced filter modal with stat/operator/value
- [x] Full URL state serialization for sharing

### Phase 2 — Formulas + Visualizations
- [x] Formula builder: modal UI, stat dropdowns + weight sliders, save/delete
- [x] Formula persistence: localStorage, formulas become sortable columns in screener
- [x] Radar charts: Canvas API, 6-stat pentagon, player overlay comparison
- [x] Scatter plots: any stat vs any stat, position-colored dots, labeled top players
- [x] Trend charts: week-by-week stat lines with filled area, per-player
- [x] Comparison mode: select players via checkboxes, side-by-side stat table + radar overlay
- [x] API: /api/players/{id}/weeks for trend data, /api/players/compare for multi-player stats
- [x] Player selection: checkbox column in screener, max 5 players, compare button

### Phase 3 — Sharing Engine + Watermark
- [x] Watermark: fixed "built different — razzle.lol" on Lab page, semi-transparent, slightly rotated
- [x] Image export: Canvas-rendered PNG of screener table with position badges, stats, watermark
- [x] Export PNG button in toolbar, auto-downloads razzle-lab-{season}.png
- [x] og:meta tags for link previews (og:title, og:description, twitter:card)
- [x] Share URL button already built in Phase 1

### Phase 1b — College/Prospect Data
- [x] college_adapter.py: fetches combine.csv and draft_picks.csv from nflverse GitHub releases
- [x] combine_data table: 2413 entries across 7 draft classes (2020-2026), full athletic testing
- [x] draft_picks table: 1549 picks with draft capital, career NFL stats, college info
- [x] Prospect API: GET /api/prospects (search, position, school, sort, draft_year), GET /api/prospect-options
- [x] NFL team name → abbreviation mapping for combine data (TENNESSEE TITANS → TEN)
- [x] Universe toggle: NFL/Prospects button in Lab toolbar with blue accent for prospect mode
- [x] Prospect columns: Draft (Rd, Pick, Team), Measurables (HT, WT), Athletic (40, Bench, Vert, Broad, Cone, Shuttle), NFL Career
- [x] 4 prospect presets: Combine, Athletic, Draft Capital, NFL Production
- [x] URL state: ?u=prospects&draft_year=2025 serialization, shareable prospect views
- [x] Season selector becomes draft year selector in prospect mode
- [x] render.yaml updated to sync college data at build time

### Phase 4 — Landing Page + Sleeper Connection
- [x] Landing page rebuilt: hero, 6 feature cards, mascot section, War Room demo, waitlist
- [x] War Room demo: 3 anonymized agent briefings with redacted content (Razzle, Scout, Diplomat)
- [x] Sleeper connection: league-intel.html with username input, Sleeper API integration
- [x] League Intel: shows leagues, expandable roster view with position groups, W-L record
- [x] Email waitlist capture (localStorage for now, backend later)

### Pre-Draft Enhancement
- [x] Multi-season NFL data: 5 seasons (2020-2024), 1238 players, 28026 stat rows
- [x] Career view: season selector "Career" option aggregates all seasons
- [x] Seasons column added to NFL columns + Dynasty preset
- [x] Backend career mode: fetch_players, fetch_screener, fetch_players_compare all support season="career"
- [x] Bootstrap on startup: server.py lifespan auto-syncs data if DB empty
- [x] render.yaml updated to sync 2020-2024 at build time
- [x] Advanced metrics: target_share, air_yards_share, WOPR, RACR, passing/receiving/rushing EPA, DAKOTA
- [x] Efficiency columns: Y/CAR, Y/REC, Y/TGT, Catch%, CMP%, Y/ATT (derived from aggregates)
- [x] Per-game averages: REC/G, TGT/G, RuYPG, ReYPG, PaYPG
- [x] Efficiency + Advanced column presets added to Lab toolbar
- [x] Rate metrics enrichment: secondary query fetches averages from player_week_metrics table
- [x] Python re-sort for derived/rate metric sorts (SQL sorts by PPR, Python re-sorts)
- [x] Season trend charts: Weekly + By Season toggle, /api/players/{id}/seasons endpoint
- [x] Season trend shows career arc across all available seasons (2020-2024)
- [x] Filter safeguards: derived metrics excluded from SQL HAVING and filter dropdown

### Pre-Launch Polish
- [x] War Room demo rotation: 33 briefings across 6 agent types, shuffled on each page load
- [x] Agent types: Razzle (7), Scout (7), Diplomat (6), Quant (5), Medical (4), Historian (4)
- [x] "Shuffle briefings" button for visitors to see more demo content
- [x] Mobile responsive: all pages (landing, Lab, League Intel) with 768px and 480px breakpoints
- [x] Nav, toolbar, table, modals, feature grid, mascot section, forms all adapt to mobile
- [x] Design audit: replaced raw hex colors in War Room demo with CSS variables
- [x] SVG favicon (tiger emoji) added to all pages
- [x] Deployed to Render

### Phase 10 — Player Profiles + Lab Enhancement
- [x] Player profile detail modal: click player name → rich modal with position-colored header, career headline stats bar
- [x] Position-specific headline stats: QB (pass yds/TDs/rush yds), RB (rush/rec yds/TDs), WR/TE (rec yds/TDs/receptions)
- [x] Season-by-season breakdown table with position-specific columns and career totals row
- [x] Combine/draft data grid: round, pick, height, weight, 40-yard, bench, vertical, broad, cone, shuttle
- [x] Career arc canvas chart: PPR per season line with filled area, position-colored, data point dots with value labels
- [x] Profile image export: canvas-rendered PNG with header, stats bar, season table, Razzle watermark
- [x] Backend: fetch_player_profile with season aggregates, derived stats enrichment, combine/draft data join
- [x] Mobile responsive profile modal
- [x] Deployed to Render

### Phase 11 — Positional Heat Maps + Breakout Detection
- [x] Heat Map tab in chart panel: canvas-rendered positional percentile grid (red→yellow→green)
- [x] 5 stat presets (PPR Core, Passing, Rushing, Receiving, Efficiency), configurable top 15/20/30
- [x] Position selector (QB/RB/WR/TE), rotated stat headers, player names + team badges
- [x] Heat map PNG export: "Export PNG" button, downloads razzle-heatmap-{position}.png with watermark
- [x] Breakout detection: backend _enrich_with_breakout() computes 50%+ YoY PPR increase
- [x] BRK% column in screener (Dynasty preset), green pill badges for breakout players
- [x] Breakout badge in player profile modal (sticker aesthetic: rotated, green, chunky border)
- [x] Deployed to Render

### Phase 12 — Prospect Cards + Athletic Percentiles
- [x] Prospect profile cards: click prospect name → rich modal with blue accent header, PROSPECT badge, school + draft info
- [x] Backend: /api/prospect-profile endpoint with position-group percentile computation for combine metrics
- [x] Athletic percentile bars: horizontal bars colored by percentile (red→orange→yellow→teal→green), inverted for time metrics
- [x] Prospect combine spider chart: canvas-rendered radar chart, 6 axes for combine metrics as percentiles, blue fill
- [x] Measurables bar: height, weight, draft round/pick, team
- [x] NFL career stats section: conditional on having NFL data (games, yards, TDs, All-Pro, Pro Bowls)
- [x] Export PNG with Razzle watermark
- [x] Mobile responsive prospect profile (responsive metric grid)
- [x] Deployed to Render

---

## Blockers

_None currently._

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-08 | Name: Razzle | One word, football DNA (razzle-dazzle), domain available, comic-strip energy |
| 2026-03-08 | Domain: razzle.lol | Cheap, memorable, fits playful brand |
| 2026-03-08 | Orange → terracotta #d97757 | Claude-esque warmth, matches tiger mascot |
| 2026-03-08 | Fresh repo, not refactor | Every line intentional, no legacy baggage |
| 2026-03-08 | Render for hosting | Already known, free tier works, zero learning curve |
| 2026-03-08 | Garfield/Luckiest Guy font | Comic-strip chunky, stands out from every AI dashboard |
| 2026-03-08 | Agents will be NFL team animals | User picks teams they like, TBD |
| 2026-03-08 | Two-table data model | player_week_stats (fixed columns) + player_week_metrics (dynamic key-value) — proven pattern from FDL |
| 2026-03-08 | Skip half_ppr in nflverse | nflverse CSVs only have ppr and standard — half_ppr computed later if needed |
| 2026-03-08 | Single FastAPI serves frontend + API | No separate static site — simpler deploy, one Render service |
| 2026-03-08 | Defer NCAA toggle to Phase 1b/2 | Need college_adapter.py first, core NFL screener is the priority |
| 2026-03-08 | Defer week-level breakdowns | Season aggregates first, per-week view adds complexity — ship the table |
| 2026-03-08 | 5 column presets over custom | PPR/Passing/Rushing/Receiving/Dynasty covers 95% of use cases |
| 2026-03-08 | Canvas API over Chart.js | Zero dependencies, full control, smaller bundle, charts are simple enough |
| 2026-03-08 | Max 5 players for compare | Keeps radar readable, prevents API abuse |
| 2026-03-08 | Formulas as weighted composites | Simple percentage weights × stat values — covers dynasty values, efficiency scores, custom rankings |
| 2026-03-08 | Waitlist in localStorage | No backend auth yet, email capture is just localStorage. Real backend waitlist post-draft |
| 2026-03-08 | Sleeper players API cached client-side | The /players/nfl endpoint is 25MB+ — should be cached/proxied server-side in production |
| 2026-03-08 | 3 War Room demo cards | Razzle/Scout/Diplomat covers the breadth of agent types without over-promising |
| 2026-03-08 | nflverse combine + draft picks over CFBD API | Free CSVs, no API key needed, same adapter pattern as NFL data. Combine metrics + draft capital are the highest-value data for draft week dynasty users |
| 2026-03-08 | "Prospects" not "College" | Available data is combine/draft focused, not full college production stats. "Prospects" better describes what we have and what dynasty users want during draft week |
| 2026-03-08 | Blue accent for prospect mode | Per design guide — NFL/NCAA toggle uses blue (#5b7fff) for college/prospect content. Visual differentiation makes the toggle obvious |
| 2026-03-08 | Filters hidden in prospect mode | Prospect dataset is small (~300/year), position + sort + search covers all use cases. Will add filters if needed later |
| 2026-03-08 | 33 demo briefings not 50-60 | North Star says 50-60, but 33 across 6 agent types with 3 shown per visit = 5456 unique combinations. Diminishing returns past ~30. Can add more later |
| 2026-03-08 | SVG favicon over PNG | Zero-dependency, scales to any size, tiger emoji matches brand, no design tool needed |
| 2026-03-08 | Pre-launch polish before Phase 5 | All code phases done. Polish (mobile, demo rotation, design audit) maximizes Reddit launch impact |
| 2026-03-08 | Multi-season data (2020-2024) | Single-season severely limits dynasty analysis. 5 seasons enables career arcs, breakout detection, year-over-year trends. Essential for Reddit draft-week content |
| 2026-03-08 | Career view as first dropdown option | Dynasty managers think in careers, not single seasons. Career aggregates are the default mental model for dynasty analysis |
| 2026-03-08 | Advanced metrics from player_week_metrics | target_share, WOPR, RACR, EPA are Reddit power user stats. Enriched via secondary query (not JOIN) to keep main query fast |
| 2026-03-08 | Python re-sort for derived metrics | Derived/rate metrics can't be sorted in SQL since they're computed post-query. Fetch extra rows, re-sort in Python. Trade-off: slightly less precise pagination but much simpler architecture |
| 2026-03-09 | Player profiles as Phase 10 | All 9 roadmap phases complete. Player profile modals are the most impactful next feature for Reddit screenshots — clicking a player name shows a rich detail view. CFBD college data deferred (needs API key). Profile export creates another shareable asset. |
| 2026-03-09 | Position-specific profile layouts | QB/RB/WR/TE each get different headline stats and season table columns. QBs see pass yards/TDs/CMP%, RBs see rush/rec, WR/TE see targets/receptions/YAC. More useful than one-size-fits-all. |
| 2026-03-09 | Heat maps + breakout detection as Phase 11 | Heat maps fill the last major visualization gap from the North Star. Positional percentile heat maps are extremely screenshottable for Reddit — dynasty managers love position tier grids. Breakout detection (50%+ YoY PPR) leverages multi-season data for a uniquely useful dynasty signal. Both create new shareable content types. |
| 2026-03-09 | Prospect cards as Phase 12 | Clickable prospect profiles with athletic percentile bars and spider charts are THE draft week content for r/DynastyFF and r/NFL_Draft. Combine percentiles within position group give instant context (is 4.50 fast for a WR?). Spider charts create a unique visual fingerprint per prospect — highly screenshottable. Uses existing nflverse combine data, no CFBD API key needed. |
| 2026-03-09 | Athletic comps + tier view as Phase 13 | "Who is this prospect's NFL athletic comp?" is THE question dynasty managers ask during draft week. Euclidean distance on percentile-normalized combine metrics finds historical matches. Tier view groups a whole position's draft class by athletic profile — creates screenshottable tier lists for Reddit. Prospect comparison mode enables side-by-side analysis. All three features use existing nflverse data, creating maximum content from available data. |
| 2026-03-09 | Composite prospect scoring as Phase 14 | Razzle Prospect Score (RPS) creates a single "how good is this prospect" number combining athletic percentile (60%), draft capital (30%), and size (10%). Big Board ranked list is THE draft-week content for dynasty Reddit — "Razzle's 2025 WR Big Board" with tier bands is an instant screenshottable PNG. CFBD college production stats blocked (no API key), so RPS maximizes value from available combine+draft data. |
| 2026-03-09 | Unified prospect report cards as Phase 15 | Prospect profile cards were missing RPS score and comp-based projections — data was spread across Big Board and profile. Consolidating everything (RPS + tier badge + percentile bars + spider chart + comps + projections) into one view creates THE definitive shareable prospect card for Reddit. One click, one card, one PNG. Client-side RPS computation avoids extra API call. Comp-based projections use weighted similarity averages of comp NFL careers. |
| 2026-03-09 | Draft class analytics as Phase 16 | Cross-year class comparison creates a new category of screenshottable content: "Is the 2025 WR class better than 2024?" posts get massive engagement on r/DynastyFF during draft season. Reuses existing RPS computation across all draft years (2020-2026). Class grades (A/B/C/D) based on avg RPS + elite/premium ratio create instant talking points. Bar chart + class cards = two shareable formats from one feature. No new external dependencies. |
| 2026-03-09 | College production stats as Phase 17 | cfbfastR play-level CSV aggregation unlocks "which WR dominated in college?" content for Reddit. sportsdataverse GitHub CSVs = free, no API key, same pattern as nflverse. Three-way universe toggle (NFL/Prospects/College) keeps the Lab as the single power tool. College profiles cross-reference combine/draft data for prospect pipeline analysis. |
