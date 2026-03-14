# Razzle — North Star Product Vision

This is the endgame. Every decision made during development should move toward this document. When in doubt about a feature, a design choice, or a prioritization call — come back here.

---

## Vision

Razzle is the research terminal that actually knows your league. A fantasy football research lab disguised as a Sunday comic strip — playful surface, deadly serious analysis underneath.

**Core Value Proposition — We solve three things:**

1. **Context awareness** — Users get league-specific insights, not generic advice. Your scoring settings, your leaguemates' tendencies, your roster construction — every answer is contextualized.
2. **LLM convenience** — Access to AI agents without manually feeding screenshots and context. No copy-pasting stats into ChatGPT. The agents already know your league.
3. **Stat discoverability** — Find any stat instantly instead of hunting across ten sources. One terminal, every metric, every format.

**Business model**: Lifestyle business. Target 10k paying users at peak = $2.4M ARR. No VC. Grown organically through Reddit.

**Brand identity**: Bengal tiger named Razzle runs the show. Playful surface, deadly serious analysis underneath. The platform never tries to look impressive — it just IS impressive once you use it. Claude-esque personality: earnest, slightly obsessive about precision, dry wit in the margins.

---

## The Three Pillars

### 1. The Lab (Free)
Our research lab — over a hundred well-defined stats across all formats. Full nflverse + college stat depth, custom formula builder, formula store, saved/shareable views with watermarked export, and generic agent queries. Monetized with Google AdSense.

**This is the growth engine.** Every screenshot is a billboard. Every shareable URL is a funnel entry. The Lab must be genuinely best-in-class as a free tool. Reddit power users must feel like they discovered a secret weapon. This is where stat discoverability lives — one terminal instead of ten browser tabs.

### 2. The Situation Room (Paid — Pro $9.99/mo or $79.99/yr, Elite $19.99/mo or $149.99/yr)
Houses six AI agents that understand your league context. Razzle and five specialist agents operating with full league context and multi-season memory. Personalized briefings, trade strategies against specific leaguemates, championship probability for your roster, injury impact on your lineup. This is where LLM convenience and context awareness converge — no prompt engineering, no screenshot feeding, just ask. Pro = BYOK (bring your own API key). Elite = API key included. Feature access is identical.

### 3. The Bureau of Intelligence (Free, Sleeper-linked)
Pulls live Sleeper data showing what competitors are doing. Connect Sleeper username to see leagues, rosters, transactions, and basic league structure. This is the conversion funnel — once users see their league data in Razzle and realize what intelligence the Situation Room could layer on top, they convert.

---

## Pages

- `home` — Landing with live anonymized Situation Room demo (50-60 pre-built permutations)
- `lab` — The Lab (screener, formulas, visualizations — 100+ stats across all formats)
- `bureau` — The Bureau of Intelligence (live Sleeper data, league context, competitor activity)
- `agents` — The Situation Room (six AI agents with full league context)

---

## The Lab — In Full

### Data Layer
- Full nflverse stat catalog (100+ columns): box score stats, snap counts, target share, air yards, EPA, CPOE, pressure rate, time to throw, separation, route participation, man/zone splits, rushing yards before/after contact, red zone usage, etc.
- College/NCAA stats: yards per carry, broken tackles, yards after contact, route participation, rush share, TD rate, draft projections.
- Adapter pattern for source swapping. Swapping = writing a new adapter, no other code changes.
- Multi-season career data stored.
- NFL/NCAA toggle in screener — blue accent for college mode.

### Core Screener
- Every stat is a filterable, sortable column.
- Advanced threshold filtering across any metric combination.
- Relevance tier toggle (fantasy-relevant vs. full universe).
- URL state: entire screener config serializable to shareable URL.

### Custom Formula Builder
- Users define weighted composite scores from any available stat columns.
- Simple UI: pick stats, assign percentage weights, name the formula.
- Formulas become sortable/filterable columns just like any other stat.
- Saved per user (localStorage, later account), shareable via URL.

### Formula Store
- Users submit formulas to a public marketplace (free by default).
- Buyers see the blended score — formula weights stay hidden (creator's IP protected).
- Optional paid listings in the future (Razzle takes 15-20%).
- Ratings/reviews so the best formulas rise.
- Creators share store listings on Reddit — growth channel.

### Visualizations
- **Radar charts** (pentagon/hexagon) — pick 5-6 stats, see player's "shape." Compare two players by overlaying.
- **Scatter plots** — any stat vs. any stat, clickable player dots.
- **Heat maps** — positional comparisons across metrics.
- **Trend charts** — stat trajectories over weeks/seasons.
- **Comparison mode** — side-by-side player profiles with stat overlays and radar charts.

### Sharing & Growth Engine
- Saved views encoded in shareable URLs.
- One-click image export with Razzle watermark (razzle.lol, always visible).
- "Share to Reddit" button — formats image cleanly for Reddit posts.
- Manual screenshots carry watermark naturally.

---

## The Bureau of Intelligence & The Situation Room

### The Bureau of Intelligence (Free, Sleeper connected)
- See your leagues, rosters, standings, transactions.
- Basic roster overview: bye weeks, position depth, roster construction.
- Live view of what competitors are doing — waiver claims, trades, roster moves.

### Bureau — Paid Tier
- Full behavioral history of every manager across all available seasons.
- Manager profiles: who panics, who hoards, who overpays in FAAB, who sells late.
- Trade deadline pressure maps — which managers are desperate and when.
- League economy trends over time.

### The Situation Room (Pro $79.99/yr BYOK, Elite $149.99/yr included — Six AI Agents)
- All six agents operate with full context: your roster, league scoring, rivals' rosters, multi-season history.
- **Razzle** (Bengal tiger) delivers prioritized daily/weekly briefings, orchestrates all agents, resolves conflicts.
- **Five specialist agents** cover: injury intelligence, scouting/breakout detection, trade negotiation/adversarial intel, projections/championship probability, league history/pattern recognition.
- Agents reference each other — Razzle synthesizes and resolves conflicts.

### Home Page — Situation Room Demo
- 50-60 pre-built anonymized Situation Room permutations.
- Agents visibly working but content redacted (???, !!!, ...).
- Rotates on each visit.
- CTA: "This is a real manager's Situation Room. Connect Sleeper to get yours."

---

## Growth Strategy & Reddit Funnel

### Organic Reddit Loop
- Target subreddits: r/fantasyfootball, r/DynastyFF, r/FantasyFootballers, r/SleeperApp
- Every Lab screenshot carries Razzle watermark — free advertising from power users.
- Shareable URLs let anyone click through to the exact view.
- Formula store creates community content and discussion threads.

### Conversion Funnel
1. Reddit user sees screenshot/link → clicks through to Lab.
2. Lab is genuinely powerful for free → user builds views, creates formulas.
3. User connects Sleeper → Bureau of Intelligence shows their leagues and competitor activity, no friction.
4. User sees Situation Room demo on home page → curiosity builds.
5. User hits a decision point → generic agent answer is fine, but league-contextualized answer from the Situation Room is clearly better → converts to Pro ($79.99/yr) or Elite ($149.99/yr).

### Retention
- Agent memory gets more valuable every season — switching cost increases over time.
- Saved formulas, saved views, agent history — all tied to account.
- Weekly Razzle briefings become habit-forming.

### Revenue Streams
1. **Primary**: Subscriptions — Pro $9.99/mo ($79.99/yr BYOK) or Elite $19.99/mo ($149.99/yr, AI included). Target 10k users at ~$100/yr blended = ~$1M ARR.
2. **Secondary**: Google AdSense on free pages — covers server costs.
3. **Tertiary**: Formula store paid listings (optional future).

---

## Technical Architecture

### Data Layer (Adapter Pattern)
```
server.py (serving layer - reads from SQLite only)
    ^
adapters/
    nflverse_adapter.py  → normalizes nflverse CSVs into common schema
    college_adapter.py   → normalizes college stats into common schema
    sleeper_adapter.py   → pulls leagues/rosters/transactions
    [future] nflpa_adapter.py → drop-in replacement for nflverse
    |
data/terminal.db (SQLite - single source of truth)
```
- Common schema: every stat from every source lands in the same table structure.
- Adapters handle fetching, cleaning, and normalizing.
- Swap a data source = write a new adapter, no other code changes.

### Auth & Payments (post-draft)
- Email/password registration (Razzle account).
- Sleeper username linked during onboarding (verified via Sleeper API).
- JWT session tokens.
- Stripe subscription tied to Razzle account.
- One Sleeper username per Razzle account (prevents sharing).

### Frontend
- No framework. HTML/JS/CSS stays dependency-free and browser-runnable.
- Charting: Canvas API or Chart.js for radar/scatter/heat/trend charts.
- Watermark: CSS-positioned fixed element, baked into image exports.
- Image export: HTML Canvas rendering of current view.

### Database Schema
- `players` — player_id, name, position, team, age, college, draft info
- `player_week_stats` — player_id, season, week, all box score stats
- `player_week_metrics` — player_id, season, week, derived metrics (EPA, CPOE, etc.)
- `college_players` — college stats, draft projections, combine data
- `users` — email, password hash, Sleeper username (post-draft)
- `user_formulas` — formula name, stat weights (JSON), creator
- `formula_store` — published formulas with ratings
- `subscriptions` — user_id, plan, status, Stripe ID (post-draft)
- `agent_memory` — per-league, per-manager behavioral data (post-draft)
- `briefings` — cached Razzle outputs per user per week (post-draft)

---

## Agent Architecture

### How Agents Work
- Agent personas serve as system prompts.
- **Free mode**: Agent receives user question + generic player data from SQLite. No league context.
- **Paid mode**: Agent receives user question + player data + full league context.

### Agent Roster
- **Razzle** (Bengal Tiger) — Chief of Staff. Orchestrator, triages all agent outputs, daily briefings, routes questions. The face of the product.
- **5 Specialist agents** (NFL team animals, TBD by user) covering:
  1. Medical Analyst — injury intelligence, recovery timelines, return-to-play
  2. Scout — player evaluation, usage trends, breakout detection, waivers
  3. Diplomat — adversarial intel, trade negotiation, FAAB bid modeling, leaguemate profiling
  4. Quant — valuations, projections, championship probability, optimal path
  5. Historian — league memory, multi-season patterns, trade precedents, draft ROI

### Agent Orchestration (Razzle as Router)
1. User asks a question or triggers a briefing.
2. Razzle parses intent → routes to relevant specialist(s).
3. Specialists return structured JSON responses.
4. Razzle synthesizes, resolves conflicts, assigns urgency tiers (URGENT, MONITOR, OPPORTUNITY).
5. Final output rendered in the Situation Room UI.

### Memory Engine
- On Sleeper connection (paid), recursively pulls league history via `previous_league_id`.
- Builds per-manager behavioral profiles:
  - FAAB patterns (average bid, max bid, positional bias, timing)
  - Trade tendencies (who initiates, acceptance rate, buy/sell windows)
  - Draft patterns (positional preferences by round, historical ROI)
  - Panic indicators (correlation between losses and roster moves)
- More seasons = richer profiles = higher switching cost.

---

## Format Coverage

Razzle doesn't need format toggles. The data is universal. Formulas let users customize. Agents adapt based on league settings. The tool serves everyone because it's flexible, not because it has separate modes.

- **Redraft**: Weekly stat windows, waiver recs, weekly injury reads, game-day briefings
- **Dynasty**: Multi-season data, full league history, dynasty values, player arcs over years
- **Keeper**: Keeper cost vs. projected return, breakout keepers at late-round cost
- **Best Ball**: Boom/bust filters, floor vs. ceiling scatter plots, upside-weighted formulas
- **DFS (future)**: Ownership projections, correlation stacking, value formulas
- **IDP (future)**: Defensive stats as filterable columns. Agents evaluate IDP same as offensive.

---

## The Fantasy Manager's Problem Loop

Every format cycles through the same core problems. Razzle and the agents form a closed loop:

1. **"Is this player healthy?"** → Medical agent
2. **"Who's emerging that I'm not seeing?"** → Scout agent
3. **"What is this player worth in MY league?"** → Quant agent
4. **"Who should I target, and how?"** → Diplomat agent
5. **"Haven't I seen this before?"** → Historian agent
6. **"Just tell me what to do right now."** → Razzle

---

## Decision-Making Framework

When making any product or implementation decision, ask in this order:

1. **Does this help The Lab get screenshotted on Reddit?** If yes, prioritize it. If no, it can wait.
2. **Does this follow the design guide?** Anthropic sand, chunky borders, Garfield font, trust the user.
3. **Does this move toward the three-pillar architecture?** Free Lab → Bureau of Intelligence (Sleeper) → Paid Situation Room.
4. **Is this the simplest version that works?** No over-engineering. Ship ugly, then polish.
5. **Would a Reddit power user care?** If no, it's not a priority before draft week.
