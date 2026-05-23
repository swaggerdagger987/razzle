# Razzle — North Star Product Vision

This is the endgame. Every decision should move toward this document. When in doubt — come back here.

---

## Vision

Razzle is a fantasy football research lab disguised as a Sunday comic strip. Playful surface, deadly serious analysis underneath. The platform never tries to look impressive — it just IS impressive once you use it.

**The core insight**: The problem with AI for fantasy football isn't that the models are dumb. It's that they start with zero context. Every time you paste your roster into ChatGPT, explain your scoring settings, and describe your leaguemates — you're doing the work the platform should do. Razzle is the context layer.

**Brand line**: "The Screener is forever free. The intelligence is what you pay for."
**Marketing**: Obsessed with fantasy football — not AI. Users get a research lab and film room that already knows their league. Never lead with "AI" (see `docs/v2/VOICE.md`).
**Mission**: "Testing weekly what's stronger — our bad luck or the numbers. Come join us."

**Brand identity**: Bengal tiger named Razzle runs the show. Film room junkie energy — earnest, slightly obsessive about precision, dry wit in the margins. Think Luffy: goofy on the outside, strongest person in the room.

**Business model**: Lifestyle business. Target enough paid users from **Reddit only** to justify reinvesting — then scale. No VC. **Primary channel: Reddit** (screenshots + future !razzle fact bot). Everything else deferred (`docs/v2/REDDIT.md`).

---

## The Product Hierarchy

### 1. The Screener (Forever Free)

The front door. A full-featured player research screener with 100+ stat columns, custom formulas, shareable views, and watermarked image export. No account required. No catch. No trial. Forever free.

**This is the growth engine.** Every screenshot is a billboard. Every shareable URL is a funnel entry. Every watermarked image posted on Reddit or sent to a group chat is free marketing. The Screener must be genuinely best-in-class as a free tool. Dynasty managers must feel like they discovered a secret weapon.

- Every stat is a filterable, sortable column
- Advanced threshold filtering across any metric combination
- NFL/College toggle for prospect research
- Custom formula builder — users create weighted composite scores
- Formula store — community marketplace for scoring models
- One-click image export with `razzle.lol` watermark
- URL state serialization — share the exact view you're looking at

### 2. The Lab Panels (Pro)

70+ analytical panels behind the Screener. This is where the depth lives. Dynasty rankings, trade values, breakout finder, aging curves, efficiency metrics, weekly heatmaps, prospect big board, career stats, game logs, and dozens more.

Free users see these in the sidebar with lock icons. Pro/Elite users get full access. The panels are what turn a curious visitor into a paying user — they can see the panel names and know what's possible, but they need to upgrade to access them.

### 3. The Bureau of Intelligence (Free summary + Pro deep-dive)

The conversion engine. Connect a Sleeper username and see your actual league data analyzed through every lens a serious manager would want.

**Free (visible to all connected users):**
- League odds summary cards — Monte Carlo championship/playoff probabilities per manager (10,000 simulations)
- Basic roster overview and standings

**Pro (deep-dive):**
- **Self-Scout** (default view) — your own team analyzed first. Depth analysis, build profile, power ranking, vulnerability flags, "how opponents see you" summary
- **Roster Depth Analysis** — starter quality vs bench depth by position, vulnerability flags, depth scores (0-100)
- **Build Profiles** — roster construction archetypes (Hero RB, Zero RB, Stars & Scrubs, Youth Movement, Win Now, Balanced)
- **Trade Network** — who trades with whom, trade balance, position tendencies, "most likely trade partner" recommendations
- **Waiver Tendencies** — FAAB burn rate, pickup hit rate, position bias, waiver hawk scores (0-100)
- **Manager Profiles** — multi-season behavioral analysis. Who panics, who hoards, who overpays in FAAB
- **Pressure Map** — desperation scores, trade deadline pressure, buy/sell windows
- **Power Rankings** — composite rankings beyond W-L (roster strength + depth + activity + schedule difficulty)
- **Head-to-Head** — full rivalry comparison between any two managers (record, roster edges, trade history, simulated matchup)
- **Strength of Schedule** — remaining matchup difficulty, easy/hard stretches, playoff path preview
- **Monte Carlo Deep-Dive** — distribution charts, odds history, scenario explorer (trade/waiver/injury what-if analysis with instant re-simulation)
- **Trade Finder** — value matching, position need/surplus detection, trade partner recommendations

**Coming soon: ESPN and Yahoo league support.**

The Bureau is the actual moat. Anyone can build a stat screener. Nobody else has league-specific behavioral profiling, Monte Carlo simulations with scenario modeling, and self-scouting feeding into AI agents — all from one Sleeper connection.

### 4. The Situation Room (Pro)

Six AI agents that already know your league. No copy-pasting rosters into ChatGPT. No explaining your scoring settings. No feeding screenshots. The agents see everything — your roster, your rivals' rosters, three seasons of transaction history, behavioral profiles, and every stat in the NFL. You just ask the question.

**The Agents:**
- **Razzle** (Bengal Tiger) — Chief of Staff. Orchestrates all agents, delivers prioritized briefings, triages into URGENT / MONITOR / OPPORTUNITY. The face of the product. Razzle doesn't hedge — "no ifs, buts, or maybes. Absolutes." Other tools say "consider starting." Razzle says "start him." Every verdict is delivered with conviction.
- **Dr. Dolphin** (Medical) — Injury intelligence. Recovery timelines, return-to-play modeling, performance impact projections. Flags buy-low and sell-high windows around injuries.
- **Hawkeye** (Scout) — Usage trends, snap counts, breakout detection, waiver targets. The film room analyst who catches things the box score misses.
- **The Fox** (Diplomat) — Trade negotiation and competitive intelligence. Models opponent psychology, calculates acceptance probability, gives leverage angles. Knows what your rivals need before they do.
- **The Octopus** (Quant) — Valuations, projections, expected value, championship probability. Leads with the number and the conclusion.
- **The Elephant** (Historian) — League memory and pattern recognition. Knows your league's past trades, your blind spots, the last time this exact scenario played out.

Agents cross-reference each other. A single briefing might have The Fox's read on an opponent, The Quant's valuation, and Hawkeye's usage flags — synthesized by Razzle into a single actionable recommendation.

**Pro** = BYOK (bring your own API key — OpenRouter, Anthropic, OpenAI).
**Elite** = API key included. Same features. The only difference is who provides the AI key.

---

## Pricing

| Tier | Monthly | Yearly | What you get |
|------|---------|--------|-------------|
| **Forever Free** | $0 | $0 | The Screener, Bureau summary odds cards, Sleeper connection |
| **Pro** | $9.99 | $79.99 | All Lab panels, full Bureau deep-dive, Situation Room (BYOK) |
| **Elite** | $19.99 | $149.99 | Everything in Pro + AI API key included (no BYOK needed) |

Pro and Elite have **identical feature access**. The only difference is BYOK vs included API key. 7-day free trial grants Pro access, no credit card required.

One Sleeper username per Razzle account — prevents trial abuse.

---

## Target Audience

### Primary: Dynasty Power Users

Dynasty managers who already use 3-5 tools (KeepTradeCut, FantasyPros, Sleeper built-in rankings, spreadsheets). They live on r/DynastyFF, fantasy Twitter, and dynasty podcast communities. They've tried asking ChatGPT for fantasy advice and been disappointed by generic answers. Age 22-40, tech-comfortable, spending $0-80/year on fantasy tools currently.

**Pain points:**
- "I asked ChatGPT about my roster and it didn't even know my scoring settings"
- "I have 6 browser tabs open just to evaluate one trade"
- "I know my leaguemate panics after losses but I can't prove it with data"
- "Every AI tool gives me the same generic advice I could get from a podcast recap"

**Why dynasty first:** They're year-round users (trades happen in the offseason, rookie drafts in May, startups June-August). They care about depth, age curves, and multi-season analysis. They spend more on tools. And they're the most vocal evangelists on Reddit.

### Secondary: Serious Redraft Players

Broader audience, lower sophistication, larger volume. Reached after dynasty users create social proof. The Screener serves them equally well. The Bureau hooks them when they connect their league.

---

## Distribution

### Phase 1: Twitter (March-April 2026)

Twitter first. Fantasy Twitter overlaps with tech Twitter — they eat up threads that blend analytical depth with fantasy football takes.

- Data-backed threads using Screener screenshots
- "ChatGPT vs Razzle with league context" comparison thread
- Build relationships with mid-tier fantasy accounts (5k-50k followers)
- Establish "context is the product" as Razzle's owned narrative

### Phase 2: Reddit (April-August 2026)

Reddit second, after Twitter creates social proof and posting history.

- Genuine community participation on r/DynastyFF for 2-3 months before any product posts
- Analysis posts using Screener data (the tool speaks through the analysis)
- "I built a thing" post when credibility is established
- Screener screenshots in comment threads settle debates with data

### Phase 3: In-Season (September-January 2027)

The product generates shareable content every week during the season.

- Weekly Lab screenshots, Situation Room briefing highlights
- Users share league odds and self-scout results in group chats
- Word of mouth within leagues — one manager using Razzle makes the whole league curious

### Growth Flywheel

Screener screenshots → Reddit/Twitter posts → watermark drives visits → free Screener hooks them → Sleeper connection personalizes it → Bureau self-scout creates "I need this" moment → trial → conversion → they tell their league → their leaguemates visit → repeat.

---

## The Moat

The moat is NOT the AI models (anyone can use Claude/GPT). The moat is NOT the stat data (nflverse is public). The moat is NOT Reddit presence (anyone can post).

**The moat is the context layer:**

1. **Sleeper integration → behavioral profiling → AI context injection.** This pipeline takes months to build. Every competitor would need to replicate the Sleeper connection, the multi-season transaction parsing, the behavioral profile engine, AND the agent architecture. Most fantasy companies are built on completely different stacks that can't bolt this on.

2. **Data density.** 70+ analytical panels, custom formulas, formula store, Monte Carlo simulations, 8+ Bureau intelligence features. The surface area is enormous. A competitor doesn't copy one feature — they'd need to replicate the entire product.

3. **Community adoption.** If r/DynastyFF adopts Razzle as "their" tool, that tribal loyalty is nearly impossible to steal. Fantasy managers don't switch tools mid-season.

4. **Agent memory compounds.** More seasons of league data = richer behavioral profiles = better agent answers = higher switching cost. Year 2 is better than year 1. Year 3 is better than year 2.

---

## Economics

### Revenue

| Scenario | Paid users | Blended revenue | Annual |
|----------|-----------|----------------|--------|
| Year 1 target | 1,000 | ~$100/user | ~$100k |
| Stretch | 3,000 | ~$100/user | ~$300k |
| Mature | 10,000 | ~$100/user | ~$1M |

### Costs

| Item | Monthly cost |
|------|-------------|
| Hosting (Render/Railway) | $25-50 |
| Domain | ~$1 |
| Elite user AI costs (~30% of paid users × $3-5/user) | $100-500 at 1,000 users |
| Claude Code subscription | ~$200 |
| **Total** | **~$350-750/month** |

**Margin: 90%+ once running.** BYOK users cost nothing to serve. Elite users cost $3-5/month in API calls. Everything else is margin.

### Breakeven

~50 paid users at $100/yr covers all operating costs. Everything above that is profit.

### Seasonality

Dynasty (primary audience) is year-round: offseason trades, rookie drafts (May), startup drafts (June-August), regular season (September-January). Revenue is less seasonal than pure redraft. Expect ~60% of revenue September-January, ~40% February-August.

---

## Technical Architecture

### Stack
- **Frontend**: Vanilla HTML/JS/CSS. No framework. Browser-runnable.
- **Backend**: Python FastAPI. Thin endpoints, data logic in live_data modules.
- **Database**: SQLite (terminal.db). Sufficient for target scale.
- **Data**: Adapter pattern. Each source has its own adapter normalizing to common schema.
- **Hosting**: Render (current), Railway (planned migration).
- **Auth**: JWT, Stripe billing, one Sleeper username per account.

### Data Flow
```
Sleeper API → rosters, transactions, league settings (client-side)
         ↓
terminal.db → 100+ stat columns, weekly/season/career (server-side)
         ↓
Bureau analysis → depth, profiles, trade network, Monte Carlo (client-side)
         ↓
Situation Room → all context injected into agent prompts (server-side for Elite, client-side for BYOK)
```

### Monte Carlo Engine
Backend computes player projection distributions (mean, stddev, floor, ceiling per player per scoring format). Frontend runs 10,000 simulations in-browser using Box-Muller normal sampling. Scenario explorer (trade/waiver/injury what-if) re-simulates instantly without API calls.

---

## Agent Architecture

### How Agents Work
- Agent personas are system prompts with structured output requirements
- **Free mode**: 5 queries/day, generic player data, no league context
- **Pro/Elite mode**: Full league context injected — roster, rivals, transactions, behavioral profiles, scoring settings
- Context enrichment: Bureau data (depth analysis, pressure scores, trade history) feeds directly into agent prompts

### Agent Orchestration
1. User asks a question or triggers a briefing
2. Razzle parses intent → routes to relevant specialist(s)
3. Specialists return structured responses
4. Razzle synthesizes, resolves conflicts, assigns urgency tiers (URGENT / MONITOR / OPPORTUNITY)
5. Cross-agent triggers fire automatically (injury → handcuff check, low odds → rebuild trade suggestion)

### Memory Engine
- On Sleeper connection, recursively pulls league history via `previous_league_id`
- Builds per-manager behavioral profiles across seasons
- More seasons = richer profiles = higher switching cost = better agent answers

---

## Format Coverage

The data is universal. Formulas let users customize. Agents adapt based on league settings.

- **Dynasty**: Multi-season data, league history, dynasty values, aging curves, player arcs
- **Redraft**: Weekly stat windows, waiver recs, injury reads, game-day briefings
- **Keeper**: Keeper cost vs. projected return, breakout keepers at late-round cost
- **Best Ball**: Boom/bust filters, floor vs ceiling plots, upside-weighted formulas
- **DFS (future)**: Ownership projections, correlation stacking
- **IDP (future)**: Defensive stats as filterable columns

---

## Decision Framework

When making any decision, ask in this order:

1. **Does this help us get to 1,000 paid users?** If it doesn't move that number, it's not a priority.
2. **Does this help the Screener get screenshotted?** Every screenshot is a billboard. Every watermark is marketing.
3. **Does this make the Bureau indispensable?** The Bureau is the conversion engine. If a manager sees their league data analyzed and doesn't feel the urge to upgrade, the Bureau isn't good enough yet.
4. **Does this follow the design guide?** Warm sand, chunky borders, comic-strip energy. The contrast between playful UI and serious analysis IS the brand.
5. **Is this the simplest version that works?** Ship it. Polish it later. A working ugly version beats a planned perfect version.
6. **Would a dynasty manager on r/DynastyFF care?** If no, it can wait.

---

## The Single Metric

**1,000 paid users.** That's it. Everything else is noise.
