# Razzle — Progress Tracker

## Current Phase: Phase 6 — War Room: Pixel Engine + Agent Canvas

### Phase 6 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | agents.html page | DONE | War Room hero (sand bg, Luckiest Guy, agent badges), dark mode canvas zone, nav on all pages |
| 2 | Pixel agent sprite sheets | DONE | 6 character PNGs (112×96, 7×4 grid of 16×24 frames) ported from FDL to frontend/assets/characters/ |
| 3 | Canvas War Room engine | NOT STARTED | 30×22 tile grid, wood floor, turf war table, furniture, collision. Ref: FDL pixel-agents/index.html |
| 4 | Agent AI + animation | NOT STARTED | State machine: IDLE/WALK/WORK/ANALYZE/DISCUSS/THINK/COFFEE. Walk frames 150ms. |
| 5 | Agent selection + camera | NOT STARTED | Click to select, camera follows, D-pad controls, name tags |
| 6 | Agent roster sidebar | NOT STARTED | Overlay panel: 6 agents with avatar, name, role, click to select |

**Exit criterion:** agents.html loads with live pixel War Room. 6 agents walk around, work at desks, visit war table. Clicking selects. Room has Razzle comic-strip aesthetic. Feels alive.

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
