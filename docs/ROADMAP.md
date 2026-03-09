# Razzle Development Roadmap

**Hard Deadline: NFL Draft Week (April 24, 2026)**

## Strategic Framing

~7 weeks until the NFL Draft. The goal is NOT to ship the entire platform. The goal is to have a free tool on Reddit that dynasty and fantasy power users can't stop screenshotting. Everything else follows from that.

**The Lab is what gets screenshotted, shared, and linked.** If The Lab is excellent, everything else has a distribution channel. If The Lab doesn't exist, nothing else matters.

## What Ships By Draft Week vs. Later

### Ships by April 24
- The Lab: full screener (nflverse + college data)
- Custom formula builder + saved formulas
- Radar charts + scatter plots
- Shareable URLs with Razzle watermark
- Image export (Share to Reddit)
- Landing page with War Room teaser
- Basic Sleeper connection (show leagues)

### Ships Later (Summer / Season)
- Formula Store (marketplace)
- Full War Room (agents, paid tier)
- League Intel (behavioral profiles)
- Auth + Stripe payments ($240/yr)
- Agent memory
- Weekly Razzle briefings
- AdSense integration

---

## Phase 0: Foundation (Days 1-3, Mar 9-11)

Clean repo, working local dev, data pipeline confirmed. Zero feature work — just scaffolding.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Project structure | Folders: /frontend, /backend, /data, /adapters, /scripts. Vanilla HTML/JS/CSS. | Folder structure in place |
| 2 | nflverse adapter | `adapters/nflverse_adapter.py`: fetch CSVs, normalize to common schema, write to SQLite | `python adapters/nflverse_adapter.py` populates terminal.db with 2024-25 data |
| 3 | Serving layer | FastAPI app. `GET /api/players?filters=...` returns JSON | `curl localhost:8000/api/players` returns player data |
| 4 | Local dev confirmed | Frontend served locally. API calls work end to end. | Browser shows raw player data from API |
| 5 | Deploy to Render | Push backend + static frontend. Confirm it runs on Render with SQLite. | razzle.lol returns data |

**Exit criterion:** Open a browser, hit API, see real NFL player stats from SQLite. No UI yet — just plumbing.

---

## Phase 1: The Lab — Core Screener (Days 4-12, Mar 12-20)

The screener IS the product. If this is good, Reddit will come.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Screener table UI | Sortable, filterable data table. 100+ columns. Horizontal scroll. Sticky player name column. Position filter tabs. | Table renders all players with sort + filter |
| 2 | Advanced filtering | Multi-condition filter builder: stat > threshold AND/OR logic. Persist in URL params. | Can filter: snap% > 60 AND target share > 20% |
| 3 | Column picker | Toggle which columns visible. Presets for common views (PPR, dynasty, efficiency). | User can show/hide any column, presets work |
| 4 | Season / week selector | Toggle between full-season aggregates and per-week breakdowns. Multi-season for career view. | Can switch between 2024 season, Week 1-18, career |
| 5 | Relevance tier toggle | Fantasy-relevant players vs. full universe. Default to relevant. | Toggle switches between ~200 relevant and ~600+ full |
| 6 | Search + URL state | Search bar for player name. Full screener state serialized to URL. | Copy URL → paste in new tab → exact same view |
| 7 | NFL/NCAA toggle | Switch between NFL and college stats in screener. Blue accent for NCAA mode. | Toggle switches data source and column set |

**Exit criterion:** The Lab loads with real data, filters work, share a URL that reproduces the exact view. Feels fast and dense.

---

## Phase 2: Formulas + Visualizations (Days 13-22, Mar 21-30)

Custom formulas are the "look what I built" hook. Charts are the "look at this comparison" hook. Both are screenshot bait.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Formula builder UI | Stat dropdowns + weight sliders + name field. Formula = weighted composite. | User creates a formula, it appears as sortable column |
| 2 | Formula persistence | Save formulas to localStorage. Load on return. Encode in shareable URL. | Formulas survive refresh and are shareable |
| 3 | Radar charts | 5-6 stat pentagon/hexagon. Select stats from dropdowns. Overlay two players. | Radar chart renders, comparison overlay works |
| 4 | Scatter plots | Any stat vs. any stat. Clickable player dots with tooltips. Color by position. | Scatter plot with real data, click dot → see player |
| 5 | Trend charts | Stat over weeks for selected player. Multi-player overlay. | Select player → see weekly stat trajectory |
| 6 | Comparison mode | Side-by-side player cards with stat overlays and radar charts. | Pick 2-3 players → see comparison view |

**Exit criterion:** Create a custom WR formula, sort screener by it, open radar chart comparing two players, and it looks like something a Reddit power user would screenshot.

---

## Phase 3: Sharing Engine + Watermark (Days 23-28, Mar 31-Apr 5)

Without this phase, everything is invisible. With it, every screenshot is a billboard.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Razzle watermark | CSS-positioned fixed element: "razzle.lol" in bottom-right. Always visible. | Watermark visible on Lab page at all times |
| 2 | Image export | HTML Canvas render of current view. Watermark baked in. Download as PNG. | Click export → get PNG with watermark |
| 3 | Share to Reddit button | Clean aspect ratio image, title suggestion, direct link back to Razzle URL. | One click → image + suggested post ready |
| 4 | Shareable URL polish | ALL state serializes cleanly. Preview card (og:image) for link posts. | Share link on Discord/Reddit → preview card shows |

**Exit criterion:** Every screenshot or link shared drives traffic back. Watermark is tasteful but unmissable. Sharing flow is frictionless.

---

## Phase 4: Landing Page + Sleeper Connection (Days 29-35, Apr 6-12)

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Landing page | Hero + CTA to Lab. Sections: Lab preview, agent teasers, War Room demo placeholder. Razzle mascot featured. | Landing page looks polished |
| 2 | War Room demo (static) | 10-15 pre-built anonymized demo scripts. Razzle "working" with redacted outputs. | Demo plays on landing page |
| 3 | Sleeper connection | Input Sleeper username → fetch leagues → display rosters on league-intel page. | User enters username → sees leagues |
| 4 | League Intel (free tier) | Show leagues, rosters, standings, bye weeks, position depth. | Connected user sees league structure |
| 5 | Waitlist / email capture | Email capture for War Room launch notifications. | Users can sign up |

**Exit criterion:** New visitor lands on home, sees polished pitch, clicks to Lab, explores data, connects Sleeper, sees leagues, optionally joins waitlist.

---

## Phase 5: Reddit Launch (Days 36-42, Apr 13-19)

| Day | Action | Detail |
|-----|--------|--------|
| 36-37 | Seed posts (value-first) | 3-4 analysis posts using Lab screenshots. No promotion — pure analysis. Watermark does marketing. |
| 38 | Community engagement | Respond to comments. Be most useful person in thread. Drop Lab links organically. |
| 39-40 | Tool reveal post | "I built a free Bloomberg terminal for fantasy football." Show screener, formulas, charts. |
| 41-42 | Sustain + iterate | Keep posting. Monitor feedback. Fix bugs. Post in r/SleeperApp about Sleeper connection. |

**Target subreddits:** r/DynastyFF, r/fantasyfootball, r/SleeperApp, r/FantasyFootballers

---

## Daily Execution Rules

1. **One phase at a time.** Do not start Phase 2 until Phase 1's exit criterion is met.
2. **Ship ugly, then polish.** Working screener with raw CSS beats beautiful landing page with no product.
3. **No auth until post-draft.** Use localStorage for formulas. Sleeper usernames as pseudo-identity.
4. **Every coding session ends with a deploy.** If it's not on Render, it doesn't exist.
5. **Screenshot test daily.** Would a Reddit power user post this? If no, that's priority.
6. **Reddit is the customer.** Every decision filtered through: "Would this get upvoted on r/DynastyFF?"

---

## Timeline Summary

| Days | Phase | Deliverable | Calendar |
|------|-------|-------------|----------|
| 1-3 | Foundation | Repo + data pipeline + deploy | Mar 9-11 |
| 4-12 | Lab: Screener | Full filterable data table | Mar 12-20 |
| 13-22 | Lab: Formulas + Viz | Custom formulas + charts | Mar 21-30 |
| 23-28 | Sharing Engine | Watermark + export + URLs | Mar 31-Apr 5 |
| 29-35 | Landing + Sleeper | Home page + league connection | Apr 6-12 |
| 36-42 | Reddit Launch | Sustained content campaign | Apr 13-19 |
| — | NFL Draft Week | Brand presence established | Apr 24-26 |
