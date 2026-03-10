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
- Landing page with Situation Room teaser
- Basic Sleeper connection (show leagues)

### Ships by May–June (Pre-Season Build)
- The Situation Room: pixel agent canvas + agent personas + scenario runner
- Agent page (agents.html) wired into nav
- OpenRouter LLM integration (browser-side, API key per user)
- Context bridge: Lab + League Intel data feeds into agent prompts
- Free generic mode + paid league-contextualized mode (gated)
- Formula Store (marketplace)

### Ships Later (Summer / Season)
- League Intel behavioral profiles (manager profiling from Sleeper history)
- Auth + Stripe payments ($240/yr)
- Agent memory (multi-season per-league persistence)
- Weekly Razzle briefings (automated)
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
| 1 | Landing page | Hero + CTA to Lab. Sections: Lab preview, agent teasers, Situation Room demo placeholder. Razzle mascot featured. | Landing page looks polished |
| 2 | Situation Room demo (static) | 10-15 pre-built anonymized demo scripts. Razzle "working" with redacted outputs. | Demo plays on landing page |
| 3 | Sleeper connection | Input Sleeper username → fetch leagues → display rosters on league-intel page. | User enters username → sees leagues |
| 4 | League Intel (free tier) | Show leagues, rosters, standings, bye weeks, position depth. | Connected user sees league structure |
| 5 | Waitlist / email capture | Email capture for Situation Room launch notifications. | Users can sign up |

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

## Phase 6: Situation Room — Pixel Engine + Agent Canvas (Days 43-52, Apr 20-29)

The Situation Room is the paid product's visual identity. Pixel agents living in a room makes Razzle feel alive. Reference FDL's `pixel-agents/index.html` for the proven canvas engine.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | agents.html page | New page in nav: "Situation Room". Razzle design system, hero section "Six Minds. One Situation Room." | Page exists, nav links to it, follows design guide |
| 2 | Pixel agent sprite sheets | 6 character PNGs (16×24 frames, 7×4 grid). Razzle tiger + 5 NFL team animals. Port FDL's char_0–5.png or create new. | 6 sprite files in `frontend/assets/characters/` |
| 3 | Canvas Situation Room engine | Full-screen canvas: 30×22 tile grid, wood floor + turf war table, furniture sprites, collision map. Port from FDL's pixel-agents/index.html. | Canvas renders the room with furniture, floor, turf table |
| 4 | Agent AI + animation | State machine: IDLE → WALK → WORK_DESK → ANALYZE_BOARD → DISCUSS → THINK → COFFEE. Walk frames cycle at 150ms. Collision detection with furniture. | Agents walk around room autonomously, visit stations, show activity bubbles |
| 5 | Agent selection + camera | Click agent to select (dashed ellipse highlight). Camera follows selected agent. D-pad controls for manual movement. Agent name tags + role labels. | Can click agents, camera tracks, D-pad works |
| 6 | Agent roster sidebar | Overlay panel showing all 6 agents: pixel avatar, name, role, current activity status. Click to select + pan camera. | Roster visible, click agent → selects + pans |

**Agent Roster (from North Star):**

| # | Name | Animal | Role | Color |
|---|------|--------|------|-------|
| 0 | **Razzle** | Bengal Tiger | Chief of Staff / Orchestrator | Terracotta #d97757 |
| 1 | **TBD** | TBD (NFL team animal) | Medical Analyst | Blue #5b7fff |
| 2 | **TBD** | TBD (NFL team animal) | Scout | Teal #2ec4b6 |
| 3 | **TBD** | TBD (NFL team animal) | Diplomat | Purple #8b5cf6 |
| 4 | **TBD** | TBD (NFL team animal) | Quant | Orange #e87422 |
| 5 | **TBD** | TBD (NFL team animal) | Historian | Red #d44040 |

**Exit criterion:** agents.html loads with a live pixel Situation Room. 6 agents walk around, work at desks, visit the war table. Clicking an agent selects them. Room looks like an NFL war room with the Razzle comic-strip aesthetic. Feels alive.

---

## Phase 7: Situation Room — Agent Personas + Scenario Runner (Days 53-62, Apr 30-May 9)

The brains behind the pixels. Each agent gets a persona prompt, structured output format, and the scenario panel lets users ask questions.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Agent persona files | 6 markdown files in `agent-personas/`: personality, reasoning style, mandatory output sections. Port + adapt from FDL's persona files for Razzle brand. | 6 files in `agent-personas/`, each with role-specific output format |
| 2 | Agent config panel | UI panel: per-agent API key + model selector + base URL. Default to OpenRouter + gpt-4o-mini. Store in localStorage. | User can set API keys, model persists across sessions |
| 3 | Scenario input panel | Text area: "Describe the situation..." + "Run All Agents" / individual agent buttons. Scenario examples pre-loaded. | User types scenario, clicks run, sees loading state |
| 4 | LLM integration | Browser-side fetch to OpenRouter (or custom base URL). Send persona + scenario + rules → receive structured response. 20s timeout, temperature 0.3. | Agent returns structured response from LLM provider |
| 5 | Specialist agent execution | 5 specialists run in parallel. Each returns role-specific structured output (Medical: injury type + duration + risk; Scout: usage trend + breakout signal; etc). | All 5 specialists return structured responses |
| 6 | Razzle orchestration | Razzle (agent 0) receives all 5 specialist outputs as peer insights. Synthesizes into prioritized brief with urgency tiers (URGENT, MONITOR, OPPORTUNITY) + conflict resolution. | Razzle synthesizes all specialist outputs into final brief |
| 7 | Response rendering | Briefing cards per agent in Situation Room UI. Razzle's synthesis at top. Collapsible specialist details. Comic-strip card styling matching design guide. | Responses render as styled cards, Razzle brief is prominent |

**Mandatory Output Sections per Agent:**
- **Razzle**: Urgency Tier, Conflicts and Resolution, GM Decision Needed
- **Medical**: Injury Type/Mechanism, Injury History, Duration Out, Return-to-Play Risk
- **Scout**: Usage Trend, Breakout Signal, Waiver Priority
- **Diplomat**: Leverage Read, FAAB Range, Trade Opening / Walkaway
- **Quant**: Current Value, Confidence Range, Optimal EV Path
- **Historian**: League Precedent, Pattern Detected, Historical Risk

**Exit criterion:** User types "Bijan Robinson questionable with knee injury" → 5 specialists respond in parallel → Razzle synthesizes → briefing cards render with structured analysis. Works with OpenRouter API key.

---

## Phase 8: Situation Room — Context Bridge + Free/Paid Gating (Days 63-72, May 10-19)

Connect the Situation Room to real data. Free users get generic answers; paid users get league-contextualized intelligence.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Lab context feed | Agent prompts auto-include: player stats from screener selection, formula scores, comparison data. "What The Lab knows" section in prompt. | Selected players in Lab feed into agent context |
| 2 | League Intel context feed | If Sleeper connected: include user's roster, league scoring settings, rival rosters, standings. "What League Intel knows" section in prompt. | Connected Sleeper data feeds into agent prompts |
| 3 | Free vs. paid prompt tiers | Free mode: agent receives question + generic player data from SQLite. Paid mode: agent receives question + player data + full league context. | Both modes work, paid mode clearly richer |
| 4 | Paywall UI gating | Situation Room page shows free generic mode by default. League-contextualized sections show blurred/redacted previews with "Unlock with Razzle Pro" CTA. | Free users see generic, paid content teased but gated |
| 5 | Home page Situation Room demo upgrade | Replace static demo with 50-60 pre-built anonymized agent briefing permutations. Agents visibly "working" with redacted outputs (???, !!!, ...). Rotates on each visit. | Landing page shows live-looking Situation Room demo |
| 6 | Agent bio cards | Public-facing bio cards for each agent: pixel avatar, name, animal, role description, "specialty" one-liner. Shown on landing page + Situation Room intro. | Agent bios visible on home + agents page |

**Exit criterion:** Free user asks a question → gets generic agent analysis. Connected Sleeper user asks the same question → gets league-contextualized answer that references their roster and rivals. The difference is obvious and compelling. Home page demo looks alive.

---

## Phase 9: Polish + Formula Store (Days 73-82, May 20-29)

Polish everything. Formula store creates community content and another Reddit growth channel.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Formula Store UI | Browse published formulas. Search/filter by position, stat type, rating. Creator name + description visible. Blended score visible, weights hidden. | Store page renders with formula cards |
| 2 | Formula publishing | "Publish to Store" button in formula builder. Name, description, position tags. Weights stay hidden (creator IP protected). | User publishes formula, appears in store |
| 3 | Formula ratings/reviews | Star rating + short review per formula. Sort by rating, popularity, newest. | Users can rate formulas, best rise to top |
| 4 | Full UX polish pass | Loading states ("pulling film..."), error states, empty states, transitions, mobile responsiveness, favicon, 404 page. | Every page has proper loading/error/empty states |
| 5 | Performance audit | Screener pagination, lazy loading, API response times, canvas frame rate. | Lab loads in <2s, Situation Room canvas runs at 60fps |
| 6 | Deploy + smoke test | Full deploy to Render. Hit every page, every API endpoint, every feature. | razzle.lol fully functional end to end |

**Exit criterion:** Complete product loop: land on home → explore Lab → create formula → publish to store → connect Sleeper → enter Situation Room → run agent scenario → see league-contextualized brief. Everything works, nothing crashes, design is cohesive.

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
| 1-3 | Phase 0: Foundation | Repo + data pipeline + deploy | Mar 9-11 |
| 4-12 | Phase 1: Lab Screener | Full filterable data table | Mar 12-20 |
| 13-22 | Phase 2: Formulas + Viz | Custom formulas + charts | Mar 21-30 |
| 23-28 | Phase 3: Sharing Engine | Watermark + export + URLs | Mar 31-Apr 5 |
| 29-35 | Phase 4: Landing + Sleeper | Home page + league connection | Apr 6-12 |
| 36-42 | Phase 5: Reddit Launch | Sustained content campaign | Apr 13-19 |
| — | **NFL Draft Week** | **Brand presence established** | **Apr 24-26** |
| 43-52 | Phase 6: Pixel Engine | Situation Room canvas + agent sprites + AI | Apr 20-29 |
| 53-62 | Phase 7: Agent Brains | Personas + scenario runner + LLM | Apr 30-May 9 |
| 63-72 | Phase 8: Context Bridge | Lab/League feeds + free/paid gating | May 10-19 |
| 73-82 | Phase 9: Polish + Store | Formula store + full UX polish | May 20-29 |
