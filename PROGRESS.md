# Razzle — Progress Tracker

## Current Phase: Phase 0 — Foundation

### Phase 0 Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project structure | NOT STARTED | Folders: /frontend, /backend, /adapters, /data, /scripts |
| 2 | nflverse adapter | NOT STARTED | Ref: FDL live_data.py sync_nflverse_player_stats |
| 3 | Serving layer (FastAPI) | NOT STARTED | Single endpoint: GET /api/players |
| 4 | Local dev confirmed | NOT STARTED | Frontend + API working end to end |
| 5 | Deploy to Render | NOT STARTED | razzle.lol returns data |

**Exit criterion:** Open browser, hit API, see real NFL player stats from SQLite.

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
