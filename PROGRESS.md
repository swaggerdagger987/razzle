# Razzle — Progress Tracker

## Current Phase: Phase 9 — Polish + Formula Store (IN PROGRESS)

**Exit criterion**: Complete product loop: land on home → explore Lab → create formula → publish to store → connect Sleeper → enter War Room → run agent scenario → see league-contextualized brief. Everything works, nothing crashes, design is cohesive.

### Phase 9 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Formula Store UI | DONE | Store overlay with 10 seed community formulas, search/filter by position, sort by popular/rating/newest, formula cards with chunky borders + offset shadows, install/uninstall, star ratings, stat preview (weights hidden), creator names. Mobile responsive. |
| 2 | Formula publishing | DONE | "Publish" button on each saved formula in formula builder. Publish modal with name, creator name, description, position tag checkboxes. Published formulas saved to razzle_store_published localStorage and appear in store. Weights hidden (stat names only). "Published" badge shows on already-published formulas. |
| 3 | Formula ratings/reviews | DONE | Clickable 1-5 star rating on each store card with hover preview. Review text input appears after rating. Reviews persist in razzle_store_reviews localStorage. Sort by popular/top rated/newest. User review displayed on card after submission. |
| 4 | Full UX polish pass | DONE | Custom 404 page with Razzle branding (tiger mascot, "checked the film" copy, navigation links). Server-side 404 handler for non-API routes. Shared .error-msg and .empty-msg CSS classes. All pages already have loading/error/empty states with Razzle personality ("pulling film...", "fumbled the data fetch..."). All pages mobile responsive. |
| 5 | Performance audit | | |
| 6 | Deploy + smoke test | | |

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
