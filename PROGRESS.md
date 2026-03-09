# Razzle — Progress Tracker

## Current Phase: Phase 4 — Landing Page + Sleeper Connection (COMPLETE)

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

### Phase 4 — Landing Page + Sleeper Connection
- [x] Landing page rebuilt: hero, 6 feature cards, mascot section, War Room demo, waitlist
- [x] War Room demo: 3 anonymized agent briefings with redacted content (Razzle, Scout, Diplomat)
- [x] Sleeper connection: league-intel.html with username input, Sleeper API integration
- [x] League Intel: shows leagues, expandable roster view with position groups, W-L record
- [x] Email waitlist capture (localStorage for now, backend later)

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
