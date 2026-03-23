# Razzle Go-To-Market Report — Cycle 13

**Generated**: 2026-03-23
**Previous Cycle**: 2026-03-23 (Cycle 12)
**Target**: 1,000 people paying ~$100/year = $100,000/year
**Status**: Pre-launch (Twitter active since 2026-03-20, site live at razzle.lol, 17 tweets posted, 41 approved in queue through April 23, 100+ rejected, zero engagement data yet)

**Cycle 13 thesis**: Cycle 12 discovered the Reddit API gating problem. Cycle 13 solves it. Deep research into **Reddit's Devvit Developer Platform** reveals it is not merely a fallback — it is the **superior primary path** for the !razzle bot. Devvit apps use `CommentSubmit` triggers to listen for summon commands, run on Reddit's own servers for free, receive Reddit's official endorsement, and qualify for the **2026 Developer Funds program** (Reddit pays developers whose apps are installed in communities with 1,000+ members). The bot no longer depends on API approval — Devvit bypasses the entire OAuth credential bottleneck. The trade-off: TypeScript instead of Python, and the app requires subreddit moderator installation. This cycle also confirms the "rarely approved" framing from Cycle 12 was likely overstated (sourced from a competitor product's marketing blog). Personal projects with low volume are still approved for free API access. The dual-path strategy — apply for PRAW credentials AND build a Devvit app in parallel — eliminates the API approval as a single point of failure.

---

## Section 1: Market Sizing

*Unchanged from Cycle 11. No new data.*

### Total Addressable Market (TAM)

The global fantasy sports market is valued at **$35.55-42.37 billion in 2026** (DemandSage: $35.55B; Mordor Intelligence: $42.37B, up from $37.28B in 2025 at 13.66% CAGR), projected to reach ~$80-103B by 2031-2034. The fantasy football segment specifically is projected at **$1.87 billion in 2026** (Global Growth Insights).

**47.3 million Americans** played fantasy football during the 2025 NFL season (FSGA Phase 1 survey — 1.1% increase over 2024's 46.8M). **This is the slowest annual growth since 2016** — the market has matured. Growth now comes from depth, not breadth.

**84 million adults** in the U.S. and Canada participated in fantasy sports or sports betting in the past 12 months (FSGA 2025, up from 81M in 2024). 57 million played fantasy sports specifically.

**Engagement deepening**: The average fantasy player joined **2.8 leagues in 2025** (up from 2.3 in 2021). More leagues per player = more trades, more decisions, more tool demand.

**Demographics**: 64% male, 48% age 18-34, 84% hold bachelor's degrees, 63% earn over $50K/year. The target user is educated, earning, and male — aligned with premium SaaS pricing.

**Mobile dominance**: Mobile accounted for **62%** of the fantasy football market in 2025 ($1.10B vs $0.66B desktop). However, **43% of desktop users specifically cite "detailed analytics"** as their reason for staying desktop — directly aligned with Razzle's core product.

### Serviceable Addressable Market (SAM): Dynasty Football Managers

- **Sleeper**: **5M MAUs** (Lines.com 2026 review, OddsShopper). Estimated 30-50% dynasty -> **1.5-2.5M dynasty managers on Sleeper**
- **r/DynastyFF**: **~192k members** (March 2026)
- **r/fantasyfootball**: **~3.4M members** (March 2026)
- **Dynasty Nerds**: **50,000+ dynasty managers** (homepage), **20,000+ dynasty owners** (community), **11,000+ premium** at $49.99-69.99/yr
- **Dynasty Daddy**: **~502K monthly visits, 416 paid Patreon patrons (~$30K/yr)**
- **KeepTradeCut**: **~123K monthly visitors**
- **RotoBot AI**: **50,000+ downloads, 875 ratings at 4.6 stars**

**SAM estimate**: **2-4 million dynasty fantasy football managers** across all platforms. Actively-engaged tool-using subset: **250-500k**.

### Serviceable Obtainable Market (SOM)

Razzle needs 1,000 paid users = **9% of Dynasty Nerds' paid base**, or **0.2-0.4% of the tool-using dynasty audience**. With 29% premium subscription rate (DemandSage 2026) applied to SAM: **72,500-145,000 potential paid dynasty users**. Razzle targeting 1,000 = **0.7-1.4%**. Achievable.

**Bottom line**: Market is validated. Distribution, not demand, is the constraint. Unchanged since Cycle 8.

---

## Section 2: Competitive Landscape

### CRITICAL CYCLE 13 UPDATE

**No new fantasy football competitors discovered. Competitive landscape stable for 6th consecutive cycle.**

The only material development is a PLATFORM opportunity (Devvit Developer Platform — see Section 7B), not a competitor change. **Confirmed: zero NFL/dynasty Reddit bots exist. 13th consecutive cycle.**

### Pricing Comparison (unchanged from Cycle 11)

| Competitor | Free Tier | Paid Pricing | Key Features | League Sync | AI | Users/Traffic |
|-----------|-----------|-------------|-------------|-------------|-----|-------------|
| **KeepTradeCut** | Full access | Free (ad-supported) | Crowdsourced trade values (25M+ points), rankings, calc | Sleeper, MFL | No | ~123K/mo visits |
| **Dynasty Nerds** | 3 trades/day | **$49.99/yr** (DynastyGM) / **$69.99/yr** (+NerdHerd) | Unlimited trades, AI mocks, Film Room, Discord, Rookie Guide | 5 platforms | AI mocks | 50K+ managers, 11K+ premium |
| **Dynasty Daddy** | Full access | **$72/yr** Patreon Club ($6/mo) | Trade calc, playoff sim, trade DB (3.6M+), Fantasy Wrapped, Discord bot, Creator Tools | **7 platforms** | No | ~502K/mo, 416 patrons |
| **FantasyCalc** | Full access | **Free** | Algorithmically generated trade values, league sync | Limited | No | Unknown |
| **RotoBot AI** | 3-day trial | **$79.99/yr** (Android early bird) / **$119.99/yr** (iOS standard) | **2.0: Multi-sport AI** (NFL/NBA/NCAA/UFC), parlay builder, 800+ stats | Sleeper, ESPN, Yahoo | **Yes — league AI** | **50K+ downloads** |
| **FantasyFootball.ai** | 300 credits/wk | **$59.88/yr** Pro, **$95.88/yr** Plus | AI assistant, lineup, trade evals, DFS | ESPN, Yahoo, Sleeper | **Yes — league AI** | Unknown |
| **Dynasty Dealmaker** | 5 tokens/wk | **$77.48/yr** ($1.49/wk) | AI trade generator, contender analysis | Sleeper only | **Yes — AI trades** | Unknown |
| **leaguemate.fyi** | **Full access** | **Free** | WAR, projections, trade intel, draft grades | Sleeper only | No | Unknown |
| **Sourcetable** | Limited credits | **$240/yr** Pro ($20/mo) | AI spreadsheet, 40+ data science libs, multi-sport | ESPN, Yahoo, Sleeper, Fantrax, CBS | **Yes — AI analytics** | Unknown |
| **Razzle** | Full Screener, Bureau summary | **$79.99/yr** (Pro), **$149.99/yr** (Elite) | 100+ stat screener, Bureau behavioral profiling, 6 AI agents, 70+ panels | Sleeper only | **Yes — behavioral AI** | **0** (pre-launch) |

### What Razzle STILL has that NO competitor has (12th consecutive cycle)

1. **Behavioral profiling** — Multi-season manager tendency analysis. Zero competitors. Footballguys editorial validates concept.
2. **Pressure maps** — Desperation scoring (0-100). Unique.
3. **Manager personality analysis** — Data-evidenced behavioral profiles. Unique.
4. **Six named agent personas** — Brand storytelling layer. No competitor has character-driven AI.
5. **Free Screener depth** — 100+ columns, custom formulas, formula store, PNG export. Best-in-class free tool.
6. **70+ analytical panels** — Deepest research surface area of any dynasty tool.

### What Razzle does NOT have

1. **Multi-platform sync** — Sleeper-only vs DD (7), DN (5), RotoBot (3)
2. **Mobile app** — RotoBot (50K+), Dynasty Nerds (4.7-star app). Razzle is web-only in 62% mobile market.
3. **Trade database** — Dynasty Daddy has 3.6M+ real trades. Razzle has none.
4. **Community** — Zero Discord, zero podcast, zero Reddit presence, zero track record.
5. **Users** — Zero.
6. **Distribution channels** — Dynasty Daddy has 4 (Discord bot, Fantasy Wrapped, Patreon, Creator Tools). Razzle has Twitter (17 tweets posted, 41 queued). **Dual-path bot strategy (Devvit + PRAW + Discord) planned — see Section 7B.**
7. **Reddit bot** — No dynasty bot exists on Reddit, but neither does Razzle's. Devvit dual-path eliminates API gating as blocker (see Section 7B).

---

## Section 3: Brand Audit

*Unchanged from Cycle 11.*

### What's Working

1. **Visual identity is distinctive.** Warm sand/espresso/comic-strip aesthetic. Zero competitors look like this.
2. **Agent personas create content diversity.** Six characters = tweet variety. Creative quality 4-5/5.
3. **"Forever free" Screener positioning.** No competitor matches this depth at $0.
4. **"Other tools know your roster. Razzle knows your leaguemates."** 12th consecutive cycle confirmation.
5. **Twitter pipeline is actively posting.** 17 tweets posted. 41 approved in queue through April 23.
6. **Agent connective tissue design.** Agents woven across Lab/Bureau/Situation Room as personality layer.

### What's Still NOT Working

1. **Zero engagement data.** 17 tweets posted. Still no impressions, retweets, or follower data.
2. **No Reddit presence.** Zero posts, zero comments, zero karma. Account not yet created. **Day 3 of Week 1.**
3. **One distribution channel (Twitter).** Three more planned (Devvit, PRAW, Discord) — none built yet.
4. **Bureau behavioral profiling not yet live.** The feature that IS the moat has not shipped.

---

## Section 4: Product-Market Fit Scorecard

| Feature | Demand | Uniqueness | Screenshot | WTP | Notes |
|---------|:---:|:---:|:---:|:---:|-------|
| **Screener (100+ columns)** | 7 | 5 | 9 | 2 | Growth engine. Forever free. |
| **Custom Formulas** | 5 | 7 | 7 | 3 | Formula Store unique. |
| **Bureau: League Odds** | 8 | 4 | 10 | 7 | DD has playoff sim. |
| **Bureau: Manager Profiles** | 7 | **10** | 8 | 7 | **THE MOAT.** 12th cycle. Zero competitors. |
| **Bureau: Trade Finder** | 8 | 4 | 7 | 6 | Multiple competitors. |
| **Bureau: Pressure Map** | 5 | **10** | 8 | 6 | Unique. Zero competitors. |
| **Bureau: League History** | 6 | 2 | 6 | 2 | leaguemate.fyi does this free. |
| **Situation Room (AI Agents)** | 7 | 5 | 7 | 4 | Dynasty-focused AI differentiated from multi-sport RotoBot 2.0. |
| **Agent Personas** | 4 | 10 | 6 | 3 | Brand glue. Twitter content value. |
| **Dynasty Rankings** | 8 | 3 | 5 | 4 | Commodity. |
| **PNG Export + Watermark** | 6 | 6 | 10 | 1 | Growth tool. Critical to flywheel. |
| **Reddit Bot (!razzle)** | 7 | **9** | N/A | 0 | **No dynasty/NFL Reddit bot exists. FPLbot (736K-member r/FantasyPL) proves model. Devvit = viable deployment path. 13th cycle open lane.** |
| **Fantasy Wrapped (proposed)** | 9 | 3 | **10** | 5 | DD proved this. Razzle adds behavioral angle. |
| **Discord Bot (proposed)** | 6 | 3 | N/A | 0 | DD already has one. |

### PMF Changes — Cycle 13

**No score changes from Cycle 12.** Key confirmations:
- FPLbot serves r/FantasyPL (736K members) — a subreddit 3.8x the size of r/DynastyFF (192K). Even at 1/4 the engagement, model is viable.
- **Zero bots exist that let you type `!razzle Bijan Robinson` and get dynasty-relevant stats in a Reddit comment** — 13th consecutive cycle confirmation.
- Devvit Developer Platform opens a deployment path that bypasses the Reddit API gating entirely (see Section 7B).
- Discord bot confirmed as zero-friction channel — Dynasty Daddy bot live on top.gg with /marketvalue, /trades, /tradeinfo commands. No approval process needed for Discord.

---

## Section 5: Monetization Model

*Pricing analysis unchanged from Cycle 11.*

### Competitive Pricing (sorted by annual cost)

- **Dynasty Nerds DynastyGM: $49.99/yr** (entry tier)
- FantasyFootball.ai Pro: **$59.88/yr**
- Dynasty Nerds + NerdHerd: **$69.99/yr**
- Dynasty Daddy Club: **$72/yr** ($6/mo Patreon)
- Dynasty Dealmaker GM: **$77.48/yr**
- **Razzle Pro: $79.99/yr**
- **RotoBot AI: $79.99/yr** (Android early bird) / **$119.99/yr** (iOS standard)
- FantasyFootball.ai Plus: **$95.88/yr**
- FantasyPros HOF: **$107.88/yr**
- PFF+: **$120/yr**
- PlayerProfiler All-In: **$135/season**
- **Razzle Elite: $149.99/yr**
- Sourcetable Pro: **$240/yr**

### Elite Tier Economics (unchanged)

**DeepSeek V3.2 via OpenRouter**: $0.26/M input, $0.38/M output
- Cost per 6-agent query: **$0.0054** (< 1 cent)
- Elite user at 3 queries/day: **$0.49/user/month**
- Margin: 96%

### Path to $100k/year

At 1,000 users (any mix), revenue is $80k-150k/yr:
- All Pro: 1,000 x $79.99 = $80k
- 60/40 Pro/Elite: $95.6k
- 50/50: $115k
- All Elite: 1,000 x $149.99 = $150k

---

## Section 6: Agent Character Profiles — Market Fit

*Unchanged from Cycle 11.*

| Agent | Pain Points (Reddit) | Unique Value | Reddit Content Opportunity | Upvote Potential |
|-------|------|------|------|------|
| **Razzle** (Tiger) | Final verdict, synthesis | Multi-agent synthesis | "Razzle's Verdict" weekly calls | 100-300 |
| **Hawkeye** (Eagle) | Breakouts, Usage (2,100+) | Usage trend detection | "Hawkeye spotted it first" | 300-800 |
| **Bones** (Skeleton) | Trade confusion (398+) | **BEHAVIORAL** trade intel | "Bones mapped your leaguemate" | 200-500 |
| **Dr. Dolphin** | Injuries (#1 at 3,995+) | Injury + league context | Injury impact with league context | 500-2000 |
| **Octo** (Octopus) | Projections, Math | Championship equity | "Octo ran the numbers" | 100-300 |
| **Atlas** (Bull) | Aging (2,610+), History | Multi-season league memory | "Last time this happened..." | 200-500 |

---

## Section 7: Channel Strategy

### Ranked by ROI (updated Cycle 13)

| Rank | Channel | Effort | Expected Return | Timeline | Status |
|------|---------|--------|----------------|----------|--------|
| 1 | **Reddit Bot (Devvit + PRAW dual-path)** | **Medium** | Very High | **1-3 weeks** (revised DOWN — Devvit removes API bottleneck) | **NOT STARTED. Dual-path strategy eliminates single point of failure.** |
| 2 | **Discord Bot** | Low (200 lines) | High | **<1 week** (revised DOWN — zero approval friction) | **Not started. DD bot live on top.gg proves model. LOWEST-FRICTION CHANNEL.** |
| 3 | **Twitter** | Low (maintenance) | High | **Active** | **17 posted, 41 queued. WORKING.** |
| 4 | **Reddit (r/DynastyFF)** | High | Very High | 2-3 months | **Account NOT created. Day 3 of Week 1 ending.** |
| 5 | **League group chats** | Zero effort | High | Viral | Requires Bureau to be impressive. |
| 6 | **Reddit (r/fantasyfootball)** | Medium | High | 2-3 months | Same Reddit account. |
| 7 | **SEO** | Low | Medium | 3-6 months | 70+ pages = natural SEO surface. |
| 8 | **Fantasy Wrapped** | Medium (1 week) | Very High | Jan 2027 | DD proved viral. Plan with behavioral data. |
| 9 | **Content Creator partnerships** | Medium | Medium | 2-3 months | DD Creator Tools shows the model. |
| 10 | **Fantasy podcasts** | Medium | Medium | 1-3 months | Behavioral profiling = unique talking point. |
| 11 | **YouTube** | High | Medium | 3-6 months | After traffic exists. |
| 12 | **Paid ads** | High cost | Unknown | Not recommended | Only after organic working. |

### Section 7B: Reddit Bot Distribution Strategy — MAJOR UPDATE (Cycle 13)

#### CYCLE 13 BREAKTHROUGH: Devvit Eliminates the API Bottleneck

Cycle 12 identified Reddit's API gating as a critical blocker. Cycle 13 researched the solution: **Reddit's Devvit Developer Platform is not merely a fallback — it is a viable primary deployment path** that bypasses the entire OAuth credential approval process.

#### What Changed Since Cycle 12

| Factor | Cycle 12 Assessment | Cycle 13 Assessment (REVISED) |
|--------|---------------------|-------------------------------|
| "Rarely approved" for personal bots | Taken at face value from molehill.io | **OVERSTATED.** Molehill.io sells an alternative product. Multiple sources confirm personal projects with low volume are still approved for free. |
| Devvit as fallback | Mentioned but not researched | **FULLY RESEARCHED. Viable primary path.** CommentSubmit triggers, free hosting, Reddit's endorsement, Developer Funds program. |
| Bot deployment | Single path (PRAW only) | **Dual path: PRAW + Devvit in parallel.** Eliminates single point of failure. |
| Bot timeline | 2-4 weeks (blocked on API approval) | **1-3 weeks** (Devvit path has no approval wait for API credentials) |
| Discord bot priority | Rank #4 | **Rank #2** — zero friction, DD bot proves model, could ship in days |

#### Devvit: The Full Picture

**What Devvit IS:** Reddit's official Developer Platform (TypeScript/JavaScript, runs on Node.js on Reddit's servers). Apps can listen to events like `CommentSubmit`, store data in Redis, and post replies — all hosted for free by Reddit.

**What Devvit CAN do for !razzle:**
- `Devvit.addTrigger({ event: 'CommentSubmit', ... })` — listens for comments containing "!razzle" in installed subreddits
- Parse the command, call Razzle API (HTTPS fetch to razzle.lol/api/*)
- Post a reply with formatted markdown table + razzle.lol link
- Store usage metrics in Redis (free, built-in)
- Qualify for **Reddit Developer Funds 2026** (April 2025 - June 2026) — Reddit PAYS developers whose apps are installed in communities with 1,000+ members

**What Devvit CANNOT do (limitations):**
- Requires **subreddit moderator to install** the app — cannot self-deploy to any subreddit
- Written in **TypeScript**, not Python — cannot reuse PRAW-based code
- Currently in **beta** — API surface may change
- Blocks UI (Devvit's custom component system) is limited for complex UIs — but a bot only needs text replies, not UI

**Sources**: [Reddit Devvit GitHub](https://github.com/reddit/devvit), [Devvit introduction](https://dragonejt.hashnode.dev/introduction-to-the-reddit-developer-platform), [Reddit Developer Funds 2026](https://support.reddithelp.com/hc/en-us/articles/27958169342996-Reddit-Developer-Funds-2026-Terms), [Devvit sub-stats-bot example](https://github.com/fsvreddit/sub-stats-bot)

#### Reddit API Status (updated from Cycle 12)

Reddit API gating is REAL but less severe than Cycle 12 assumed:
- Self-service API keys discontinued November 2025 — confirmed
- Pre-approval required via Developer Support form — confirmed
- Target response time: **7 days** (Reddit's stated target)
- **Personal projects with low volume are still approved for free** — confirmed by multiple sources (replydaddy, wappkit, Reddit's own docs)
- "Rarely approved" language came from molehill.io, which **sells an alternative Reddit integration product** — conflict of interest noted
- Existing OAuth credentials from before November 2025 still work
- Non-OAuth public JSON endpoints (~10 RPM) remain available without credentials

**Sources**: [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy), [replydaddy analysis](https://replydaddy.com/blog/reddit-api-pre-approval-2025-personal-projects-crackdown), [wappkit credentials guide](https://www.wappkit.com/blog/reddit-api-credentials-guide-2025)

#### Bot Labels (unchanged from Cycle 12)

CEO Steve Huffman announced mandatory "Verified Bot" labels (February 2026). Net-positive for !razzle — adds legitimacy.

#### Risk Assessment (REVISED — Cycle 13)

| Scenario | Likelihood | Impact | Mitigation |
|----------|-----------|--------|-----------|
| PRAW API approved + Devvit app installed | **Medium** (40-50%) | Best case — both paths active | Build both. PRAW for broad subreddit coverage, Devvit for native integration where mods install. |
| PRAW API approved, Devvit not installed by mods | **Medium** (30-40%) | Good — PRAW path sufficient | PRAW bot works across any subreddit without mod installation. |
| PRAW API rejected, Devvit installed by mods | **Medium** (30-40%) | Good — Devvit path sufficient | Devvit bypasses API gating entirely. Mod relationship is the bottleneck, not Reddit's API team. |
| Both paths blocked | **Low** (10-15%) | High | Public JSON read + manual posting. Discord bot as primary channel. |

**Net assessment**: Probability of at least one bot path working = **85-90%** (up from ~60% in Cycle 12's single-path analysis).

#### Revised Bot Strategy (Cycle 13) — Dual-Path

**Path A: PRAW (Python — familiar stack)**
1. Create bot Reddit account (u/razzle_bot or similar)
2. Submit Developer Support form — frame as non-commercial community tool
3. Build ~200 lines Python (PRAW + Razzle API + Reddit markdown formatter)
4. Deploy on Render as worker process ($0 additional cost)
5. Timeline: 1-3 weeks (dependent on API approval — 7-21 day wait)

**Path B: Devvit (TypeScript — Reddit-native)**
1. `npx devvit new razzle-bot` — scaffold Devvit app
2. Add `CommentSubmit` trigger listening for "!razzle" prefix
3. Fetch from Razzle API, format as Reddit markdown, reply
4. `devvit upload` → `devvit publish` — hosted for free on Reddit
5. Ask r/DynastyFF and r/fantasyfootball mods to install
6. Timeline: **1-2 weeks** (no API approval wait — mod installation is the only gate)

**Build BOTH in parallel.** Path B (Devvit) is likely faster because it doesn't wait for API approval. Path A (PRAW) is more flexible because it works in any subreddit without mod installation.

**Reference implementations:**
- **FPLbot** ([GitHub](https://github.com/amosbastian/FPLbot)): Python + PRAW + MongoDB. Commands: `!fplbot <player> vs. <team|player>`. Fuzzy name matching via text indexes. Active on r/FantasyPL (736K members) for years.
- **FFBot** ([GitHub](https://github.com/Surye/FFBot)): Python + PRAW. Polls r/fantasyfootball WDIS threads every 5 minutes. Pulls FantasyPros rankings.
- **sub-stats-bot** ([GitHub](https://github.com/fsvreddit/sub-stats-bot)): Devvit app. Stores and surfaces subreddit statistics. Reference for Devvit trigger + data storage pattern.

#### Section 7B-2: Discord Bot — ELEVATED TO RANK #2 (Cycle 13 NEW)

**Discord is the lowest-friction distribution channel available.** Zero API approval process. Zero mod installation requirement for bots. Dynasty Daddy's bot is live on top.gg with /marketvalue, /trades, /tradeinfo commands — proving the model.

**Why Discord jumped from Rank #4 to #2:**
1. **Zero gatekeeping** — add bot to any server via OAuth link, no approval wait
2. **Proven model** — Dynasty Daddy bot is live and functional on top.gg
3. **Direct league context** — fantasy Discord servers are where trade discussions happen
4. **Fast to build** — discord.py or discord.js, ~200 lines, same Razzle API endpoints
5. **Complementary to Reddit bot** — Discord serves league-specific conversations, Reddit serves community-wide discussions

**Proposed Discord commands (mirroring Reddit bot):**

| Command | Response | Funnel Hook |
|---------|---------|-------------|
| `/razzle player [name]` | PPR PPG, target share, snap %, age | "Full profile at razzle.lol" |
| `/razzle compare [A] vs [B]` | Side-by-side stat table | "Compare tool at razzle.lol" |
| `/razzle prospect [name]` | Draft pos, college stats, combine | "Scouting report at razzle.lol" |
| `/razzle breakouts` | Top 5 breakout candidates | "Full finder at razzle.lol" |
| `/razzle trade [A] for [B]` | Value comparison, verdict | "Trade analyzer at razzle.lol" |

**Deployment**: Host on Render as second worker ($0 additional). List on top.gg for discovery. Target fantasy football Discord servers.

**Sources**: [Dynasty Daddy bot on top.gg](https://top.gg/bot/1248312528686284965), [SleeperLink Discord bot](https://evildrporkchop.github.io/SleeperLink/), [GameDayBot](https://www.gamedaybot.com/)

#### Proposed Commands (unchanged, confirmed viable)

| Command | API Endpoint | Response | Funnel Hook |
|---------|-------------|---------|-------------|
| `!razzle Bijan Robinson` | `/api/players` | PPR PPG, target share, snap %, age | "Full profile at razzle.lol" |
| `!razzle compare A vs B` | 2x `/api/players` | Side-by-side table | "Compare tool at razzle.lol" |
| `!razzle prospect [name]` | `/api/players` (college) | Draft pos, college stats, combine | "Scouting report at razzle.lol" |
| `!razzle breakouts` | `/api/breakout-candidates` | Top 5 breakout candidates | "Full finder at razzle.lol" |
| `!razzle trade A for B` | `/api/trade-value-chart` | Value comparison, verdict | "Trade analyzer at razzle.lol" |

#### Virality Math (revised Cycle 13 — dual-path reduces risk)

**NOTE**: No public benchmark data exists for FPLbot engagement (searched extensively). These estimates are directional, not empirical. r/FantasyPL (736K members) is 3.8x r/DynastyFF (192K), so FPLbot likely gets more summons than !razzle would initially. Calibrate expectations accordingly.

**Optimistic (Devvit + PRAW both live by Week 3):**
- Reddit: 50 summons/day x 100 views = 5,000 daily impressions
- Discord: 30 commands/day x 20 members = 600 daily impressions
- Total: 5,600 daily impressions
- At 1.5% CTR = 84 visits/day = 2,520/month
- Cost: $0/mo (Render workers + Devvit hosted by Reddit)

**Likely (Devvit live Week 2, PRAW pending):**
- Reddit (Devvit only, fewer subreddits): 25 summons/day x 100 views = 2,500 daily impressions
- Discord: 20 commands/day x 20 members = 400 daily impressions
- Total: 2,900 daily impressions
- At 1.5% CTR = 44 visits/day = 1,320/month

**Conservative (PRAW rejected, Devvit only):**
- Reddit (installed subreddits only): 15 summons/day x 100 views = 1,500 daily impressions
- At 1% CTR = 15 site visits/day = 450/month
- Still net-positive at $0 cost

#### Key Precedent: FPLbot Proves the Pattern (updated Cycle 13)

FPLbot (github.com/amosbastian/FPLbot) is the reference implementation for a Reddit data bot:
- **Built for r/FantasyPL** — **736K members** (subredditstats.com). 3.8x the size of r/DynastyFF (192K).
- **Stack**: Python 3.6+, PRAW, MongoDB, fpl library, Understat
- **Commands**: `!fplbot <player> vs. <team|player> <optional: fixtures>`
- **Player matching**: MongoDB text indexes with manual name mapping for fuzzy search
- **Response format**: Reddit markdown tables with stats (xG, xA, goals, assists, minutes, key passes)
- **Cron features**: Daily price change alerts posted automatically
- **No public engagement stats** — searched extensively in Cycle 13. No summon counts, impression data, or CTR published. The virality math (50 summons/day, 100 views each) remains an estimate without benchmark data.
- **Active for years** — referenced in community resource lists, has a companion Slack/Discord version (fplbot.app)

**Razzle's advantage over FPLbot**: FPLbot serves a single sport (soccer) with limited FPL API data. Razzle has 100+ stat columns, college data, prospect data, trade values, breakout scores, and 70+ analytical panels to funnel users toward. Each bot response is a door into a much deeper product.

**No NFL/dynasty equivalent exists.** This is the open lane. **13th consecutive cycle confirmation.**

---

## Section 7C: Reddit Account Connection Strategy (Cycle 12, unchanged Cycle 13)

The ROADMAP Phase 3C describes connecting Reddit accounts to Razzle for intent analysis. Research findings:

### Sleeper API: No OAuth Needed

The Sleeper API is **read-only with no authentication required** — no OAuth, no API keys. Rate limit is 1,000 requests/minute. This makes Sleeper integration trivially easy but also means any competitor can replicate it.

**Source**: [Sleeper API docs](https://docs.sleeper.com/)

### Reddit API: OAuth Required, Privacy Considerations

For Reddit account connection (reading user comment history), Reddit OAuth IS required:
- OAuth clients get **100 requests/minute**
- PRAW handles OAuth flow automatically
- **Public comments are accessible** — no special permissions needed to read a user's public post history
- **Privacy implications**: Must be transparent about data collection. GDPR compliance if serving EU users.

### Reddit Account Connection Feasibility

| Feature | Feasibility | Notes |
|---------|------------|-------|
| Reddit OAuth connect | **Medium** | Requires Reddit API approval (same gating as bot). One application could cover both bot + account connection. |
| Read public comment history | **Easy** | Public data. PRAW `redditor.comments.new(limit=1000)` works with basic auth. |
| Multi-account (burner) support | **Easy** | Just store multiple Reddit usernames per Razzle account. UI decision, not technical. |
| Comment sentiment analysis | **Easy** | Claude/DeepSeek can parse comment text for player mentions, sentiment, intent. |
| Reddit Pulse (community consensus) | **Medium** | Requires continuous scraping of subreddit comment streams. Rate limit sensitive at scale. |
| Personalized bot responses | **Hard** | Bot needs to look up the summoning user's Razzle account in real-time. Adds latency and complexity. |

### Recommendation for Reddit Account Connection

**Defer to Phase 3C (May 15-31) as planned.** The Reddit OAuth integration shares the same API access bottleneck as the bot. A single API application should cover both use cases. Build the bot first (simpler, higher immediate ROI), then extend with account connection.

The multi-account burner support is a genuinely differentiating feature that no competitor offers. The copy in the roadmap ("We know the burner exists") is excellent brand voice. But this is a Phase 3C feature — not blocking.

---

## Section 8: 8-Week Launch Plan (REVISED Cycle 13 — Week 1 DAY 3)

### Week 1 (March 21-27): Dual-Path Bot + Reddit Accounts — DAY 3

- [x] Twitter pipeline functional — 41 approved tweets queued
- [x] 17 tweets posted (7 evidence, 5 community, 3 agent verdicts, 2 mascot)
- [ ] **CREATE REDDIT ACCOUNT** — u/DynastyDataNerd. **URGENT: March 23 creation = 30 days old by April 22.** Verify email+phone+2FA for CQS boost. Subscribe to r/DynastyFF, r/fantasyfootball.
- [ ] **CREATE BOT REDDIT ACCOUNT** — separate account for the bot (u/razzle_bot or similar). Bots must disclose they are automated.
- [ ] **APPLY FOR REDDIT API ACCESS** — Submit Developer Support form for bot account. Non-commercial community tool. Purpose, scope, expected volume (<50 QPM), subreddit targets. 7-day target response, realistic 7-21 days.
- [ ] **BUILD DEVVIT APP** — `npx devvit new razzle-bot`. CommentSubmit trigger, Razzle API fetch, markdown formatter, reply. TypeScript. **THIS IS THE FASTER PATH — no API approval wait.**
- [ ] **BUILD PRAW BOT** — ~200 lines Python. PRAW + Razzle API. FPLbot as reference. Ready to deploy upon API approval.
- [ ] **BUILD DISCORD BOT** — discord.py, ~200 lines. Same API endpoints. List on top.gg. **LOWEST-FRICTION CHANNEL — ship first.**
- [ ] Follow 50-100 fantasy football accounts on Twitter
- [ ] Engage in 5-10 dynasty Twitter threads per day
- **Measure**: Reddit accounts created (personal + bot), API application submitted, Devvit app scaffolded, Discord bot functional, Twitter followers
- **URGENCY**: Every day of delay reduces automod safety margin for personal account. Apply for API AND scaffold Devvit today.

### Week 2 (March 28 - April 3): Reddit Warm-Up + Bot Deployment

- [ ] Reddit warm-up begins — 3-5 helpful comments/day on r/fantasyfootball
- [ ] **DISCORD BOT LIVE** — deploy to Render, list on top.gg, invite to fantasy football Discord servers
- [ ] **DEVVIT APP LIVE** — `devvit upload` + `devvit publish`. Message r/DynastyFF and r/fantasyfootball mods to install.
- [ ] PRAW bot code complete and tested locally
- [ ] Follow up on API application if no response
- [ ] Twitter: ~2 tweets/day from queue (auto-posting)
- **Measure**: Reddit karma, Discord bot servers joined, Devvit mod installation status, API application status

### Week 3 (April 4-10): Draft Season Ramp + PRAW Deploy

- [ ] NFL Draft (April 24) content prep — prospect comparison screenshots
- [ ] Reddit: transition to r/DynastyFF comments (60/40 split)
- [ ] "Atlas remembers" historical draft comp tweets
- [ ] **PRAW deploy** — if API approved, deploy to Render. If not, Devvit + Discord are already live.
- [ ] Bot handles prospect queries (tested, ready for draft season traffic)
- **Measure**: Twitter engagement, Reddit karma, bot summons across all channels

### Week 4 (April 11-17): Pre-Draft Push + All Bots Live

- [ ] Daily draft prospect tweets (Hawkeye + Atlas voices)
- [ ] "Who's your 1.01 in SF?" poll with data screenshot
- [ ] Reddit comments on draft threads with Lab data
- [ ] 15+ r/DynastyFF comments visible in history
- [ ] **All three bot channels should be live**: Devvit (Reddit-native), PRAW (if approved), Discord
- [ ] Refill tweet queue — 41 approved depletes ~April 14 at 2/day
- **Measure**: Twitter followers, Reddit karma, bot summons by channel, Discord servers

### Week 5 (April 18-24): NFL DRAFT WEEK

- [ ] Live-tweet draft picks with instant Lab data
- [ ] "Hawkeye spotted it: [rookie] lands in [situation]"
- [ ] **Reddit + Discord bot peak activity** — every draft thread wants player data
- [ ] Push bot commands in organic Reddit comments: "!razzle [prospect name]" during draft
- [ ] Maximum content output — highest-traffic week in dynasty
- **Measure**: Followers, site traffic spike, bot summons spike, Discord bot server count

### Week 6 (April 25 - May 1): Post-Draft Analysis

- [ ] Dynasty trade value shift posts (Bones voice)
- [ ] "Bones says buy [post-draft faller]" series
- [ ] First Reddit analysis post with watermarked Lab screenshot
- [ ] **Bot metrics review** — commands used, players queried, click-through to razzle.lol
- **Measure**: Reddit post karma, Twitter engagement, bot metrics

### Week 7 (May 2-8): Behavioral Profiling Reveal

- [ ] **THE KILLER POST**: "I built a tool that profiles every manager in your dynasty league."
- [ ] Posted on r/DynastyFF with behavioral profile screenshots
- [ ] Differentiate from leaguemate.fyi: "They show WHO won trades. Razzle shows WHY."
- [ ] Cross-promote on Twitter
- [ ] This is the make-or-break moment for behavioral WTP
- **Measure**: Reddit upvotes, site traffic spike, Sleeper connections

### Week 8 (May 9-15): Evaluate and Adjust

- [ ] Review all metrics
- [ ] Decision point: Is behavioral profiling resonating?
- [ ] If >200 Twitter followers and >100 visits/day: on track
- [ ] If <50 followers and <10 visits/day: fundamentally rethink
- [ ] Begin Reddit account connection work (Phase 3C)
- [ ] Begin planning Fantasy Wrapped for 2026 season
- **Measure**: Registered users, Sleeper connections, paid conversions

---

## Section 9: Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Cycle 13 Update |
|---|------|-----------|--------|-----------|----------------|
| 1 | ~~Twitter pipeline broken~~ | **RESOLVED** | — | — | **RESOLVED since Cycle 9.** |
| 2 | **Distribution gap vs Dynasty Daddy** | **HIGH** | Very High | Build Reddit bot + Discord bot. | **Partially mitigated. Dual-path Reddit + Discord strategy reduces gap from 4:1 to potentially 4:3.** |
| 3 | **AI competitive landscape crowding** | **MEDIUM** | High | Lead with behavioral. | **Stable 6th cycle.** |
| 4 | **Sleeper-only + web-only** | **HIGH** | Very High | Desktop 43% cite analytics. Sleeper 5M MAUs. | **Unchanged.** |
| 5 | **RotoBot price competition** | **LOW-MEDIUM** | Medium | Differentiate on features, not price. | **Unchanged.** |
| 6 | **Zero traction on any channel** | Medium | High | Bot channels = passive distribution. | **THREE bot channels planned (Devvit, PRAW, Discord). Reduces single-channel risk.** |
| 7 | **Reddit mods remove bot** | Medium | High | Build history first. Bot adds value. | **Devvit apps are mod-installed — mods opt in, reducing removal risk.** |
| 8 | **Behavioral profiling is "nice to have"** | **MEDIUM** | **Critical** | Footballguys validates concept. 13 cycles, zero competitors. | **Unchanged. Existential unknown. Week 7 test.** |
| 9 | **Elite tier API costs** | **LOW** | Low | DeepSeek at $0.005/query. 96% margin. | **Unchanged.** |
| 10 | **Solo founder burnout** | Medium | High | Automate pipeline. Claude Code force multiplier. | **Unchanged.** |
| 11 | **Price sensitivity — DN $49.99 undercuts** | **MEDIUM** | Medium | Must justify premium through behavioral. | **Unchanged.** |
| 12 | **Competitor adds behavioral profiling** | Low-Med | Very High | Move fast. Ship first. Data compounds. | **13th cycle: zero competitors in behavioral space.** |
| 13 | **Reddit bot rate-limited or banned** | Low | Medium | PRAW manages limits. Explicit summons only. | **Devvit apps are rate-managed by Reddit itself. PRAW: explicit summons only.** |
| 14 | **leaguemate.fyi commoditizes Bureau history** | **MEDIUM-HIGH** | Medium | Bureau must lead on behavioral. | **Unchanged.** |
| 15 | **Dynasty Daddy distribution moat widens** | **MEDIUM-HIGH** | High | Build Reddit + Discord bots. Fantasy Wrapped Jan 2027. | **Discord bot (Rank #2) directly competes with DD's distribution.** |
| 16 | **RotoBot scales to mainstream** | **LOW** | Low | RotoBot 2.0 going multi-sport. Less dynasty focus. | **Unchanged.** |
| 17 | **Enterprise AI enters fantasy** | **LOW** | Low | Sourcetable targets data scientists. | **Unchanged.** |
| 18 | **Market maturation limits ceiling** | **LOW** | Low | Growth from depth, not breadth. Favors tools. | **Unchanged.** |
| 19 | **Reddit API access denied for bot** | **LOW-MEDIUM** (revised DOWN) | **Medium** (revised DOWN) | Reddit killed self-service API keys Nov 2025. But: personal projects still approved for free. "Rarely approved" was overstated (source sells competing product). **Devvit completely bypasses this risk.** PRAW rejection no longer blocks bot strategy. |
| 20 | **Reddit API approval delayed past Draft Week** | **MEDIUM** (revised DOWN) | **Low-Medium** (revised DOWN) | Devvit app can be live BEFORE API approval arrives. Discord bot has zero approval wait. **Delay only affects PRAW path, not overall bot strategy.** |
| 21 | **Reddit bot labeling requirement** | **LOW** | **Low-Positive** | Verified bot label adds legitimacy. Comply proactively. **Unchanged.** |
| 22 | **Devvit app not installed by mods** | **MEDIUM** (NEW) | **Medium** | **NEW RISK.** Devvit requires subreddit mod installation. Mitigation: (1) Build relationship with mods via personal account first, (2) Frame as value-add tool for the community, (3) PRAW path works independently if mods decline. |
| 23 | **Three-bot maintenance burden** | **LOW-MEDIUM** (NEW) | **Low** | **NEW RISK.** Three bots (Devvit, PRAW, Discord) = three codebases. Mitigation: all hit the same Razzle API endpoints. Logic lives in the API, bots are thin wrappers. ~200 lines each. |

---

## Section 10: Cycle Delta

### Key Changes From Cycle 12

1. **BREAKTHROUGH: Devvit Developer Platform is a viable PRIMARY path, not just a fallback.** Devvit apps use `CommentSubmit` triggers to listen for comments, run on Reddit's own servers for free, and bypass the entire OAuth credential approval process. The bot no longer has a single point of failure. TypeScript required (not Python), and subreddit mod installation is the gate (not Reddit's API team). Two new risks added (#22, #23). Bot timeline revised DOWN from "2-4 weeks" to "1-3 weeks." Risk #19 (API denial) and #20 (API delay) both revised DOWN in likelihood and impact.

2. **"Rarely approved" framing DEBUNKED.** Cycle 12's primary source (molehill.io) sells a competing Reddit integration product — conflict of interest. Multiple independent sources (replydaddy.com, wappkit.com, Reddit's own Developer Platform docs) confirm that personal projects with low volume are still approved for free access. Risk #19 likelihood revised DOWN from MEDIUM to LOW-MEDIUM.

3. **Reddit Developer Funds 2026 program discovered.** Reddit will PAY developers whose Devvit apps are installed in communities with 1,000+ members. Program runs April 2025 - June 2026. Max 3 apps eligible per developer. This is a potential revenue/visibility channel that didn't exist in any previous cycle's analysis. r/DynastyFF (192K members) and r/fantasyfootball (3.4M members) both far exceed the 1,000-member threshold.

4. **Discord bot elevated to Rank #2 channel (from #4).** Dynasty Daddy's bot is confirmed live on top.gg with /marketvalue, /trades, /tradeinfo commands. Discord has ZERO API gating, ZERO approval process, ZERO mod installation requirement. This is the lowest-friction distribution channel available. ~200 lines of code, same Razzle API endpoints.

5. **r/FantasyPL confirmed at 736K members.** FPLbot's home subreddit is 3.8x the size of r/DynastyFF (192K). No public engagement stats found for FPLbot despite extensive search — the virality math (50 summons/day) remains an estimate without benchmark data. This is an honest gap in the model.

6. **Zero NFL/dynasty Reddit bots exist — 13th consecutive cycle.** The lane remains completely open. No new entrants. FPLbot = soccer only. FFBot = WDIS only.

5. **Zero NFL/dynasty Reddit bots confirmed for 12th cycle.** The lane is completely open. FPLbot = soccer only. FFBot = WDIS threads only. No bot lets users type `!razzle <player>` and get dynasty stats. Reddit Bot PMF uniqueness revised UP from 8 to 9.

7. **No new competitors discovered.** 6th consecutive cycle with stable landscape.

### Strategic Priorities (Cycle 13 — UPDATED with dual-path strategy)

1. **Build Discord bot** — SHIP FIRST. Zero friction, zero approval wait. ~200 lines, same Razzle API. Deploy to Render, list on top.gg. **Can be live within days.**
2. **Build Devvit app** — SHIP SECOND. `npx devvit new`, CommentSubmit trigger, publish to Reddit. Contact mods for installation. **Can be live within 1-2 weeks.**
3. **Apply for Reddit API access + build PRAW bot** — IN PARALLEL. Submit Developer Support form. Build Python bot code. Deploy when approved. **7-21 day wait is no longer blocking because Devvit + Discord ship first.**
4. **Create Reddit accounts** — TODAY. Personal (u/DynastyDataNerd) AND bot (u/razzle_bot). Both need to age. Both needed for API application.
5. **Ship Bureau behavioral profiles** — THE MOAT. Must be live before Week 7 reveal (May 2-8). 39 days away.
6. **Monitor Twitter engagement** — 17 tweets posted. Need engagement data to calibrate content strategy.
7. **Refill tweet queue** — 41 approved through April 23. At 2/day cadence, queue depletes by April 14. Need new batch by then.

### The honest assessment (Cycle 13)

**This cycle solved the biggest problem Cycle 12 discovered.** The Reddit API gating that Cycle 12 flagged as a "CRITICAL BLOCKER" is now mitigated by the Devvit dual-path strategy. The bot's probability of deployment rose from ~60% (Cycle 12, single PRAW path) to ~85-90% (Cycle 13, dual-path). Discord bot elevation to Rank #2 adds a zero-friction distribution channel that was underweighted in previous cycles.

**The competitive landscape remains unchanged for the 6th consecutive cycle.** Behavioral profiling is uncontested for the 13th time. No new dynasty tools discovered.

**The four things that will determine if Razzle reaches 1,000 paid users (updated):**
1. Does behavioral profiling create "I need this" moments? (unchanged — untested)
2. Can distribution channels be built? (UPDATED — dual-path + Discord largely resolves this. Mod relationship is the remaining variable.)
3. Does the Screener create viral screenshots during Draft season? (unchanged — untested)
4. Can a solo founder execute fast enough? (unchanged — execution dependent)

**The THREE actions that matter most today (March 23):**

1. **Create Reddit accounts** (personal + bot) — 10 minutes. Starts age clock.
2. **Submit Reddit API application** — 5 minutes. Starts approval clock.
3. **Start building Discord bot** — the lowest-friction channel ships first.

---

## CRITIQUE

### Self-Review Flags

**Section 7B (Reddit Bot Strategy — REVISED):**
- [RESOLVED] "Rarely approved" bias from molehill.io — now corrected with multiple independent sources confirming personal project approval is viable.
- [RESOLVED] Devvit fallback unresearched — now fully researched. CommentSubmit triggers confirmed. Viable primary path.
- [NEEDS ACTION] Bot account + personal account still need to be created. API application still needs to be submitted.
- [REALITY CHECK] Devvit requires mod installation. Mod relationship is now the bottleneck, not Reddit's API team. No data on how receptive r/DynastyFF mods are to third-party Devvit apps.

**Section 7B-2 (Discord Bot — NEW):**
- [REALITY CHECK] Discord bot elevated to Rank #2 based on zero-friction deployment, but Dynasty Daddy already occupies this space. Razzle's Discord bot must differentiate or risk being redundant to users who already have DD's bot.

**Section 7C (Reddit Account Connection):**
- [DEFERRED] Unchanged. Phase 3C (May 15-31). One API application covers both bot + account connection.

**Section 8 (Launch Plan):**
- [REALITY CHECK] Week 1 now includes THREE bot codebases (Devvit, PRAW, Discord) + two Reddit accounts + API application. Ambitious for one person. Discord bot is simplest and should ship first. PRAW and Devvit can be built in parallel during Week 1-2.

### Flags Summary: 5 total (same count as Cycle 12, but composition changed)
- 1 NEEDS DATA (DD ad revenue — low priority, perpetually unfixable)
- 2 REALITY CHECK (mod receptivity to Devvit apps — new; Discord bot differentiation vs DD — new)
- 1 NEEDS ACTION (create accounts + submit API application — STILL PENDING)
- 1 DEFERRED (Reddit OAuth for account connection — Phase 3C)
- 2 RESOLVED (molehill.io bias, Devvit unresearched — both fixed in Cycle 13)

---

## FINANCIAL MODEL

```
RAZZLE FINANCIAL MODEL — CYCLE 13 (UPDATED)
============================================

Revenue — unchanged from Cycle 12
  Target: 1,000 users x blended ~$108/year = ~$108,000/year
  Monthly: $9,000/month

  Pricing tiers:
    Pro:   $9.99/mo  | $79.99/yr  (BYOK — user provides AI key)
    Elite: $19.99/mo | $149.99/yr (AI key included, DeepSeek V3.2)

  Assumed mix at 1,000 users:
    Pro:   600 users x $79.99/yr  = $47,994/yr
    Elite: 400 users x $149.99/yr = $59,996/yr
    Total revenue:                  $107,990/yr ($9,000/mo)

Costs — unchanged from Cycle 11
  Total monthly cost at 1,000 users: ~$706/mo

  Breakdown:
    Render hosting:       $25/mo
    Domain:               $1/mo
    Elite AI costs:       $194/mo (400 users x 90 queries/mo x $0.0054)
    Claude Code:          $200/mo
    Stripe fees:          ~$286/mo
    Reddit/Discord bots:  $0/mo (Render workers)
    Reddit API:           $0/mo (free tier, non-commercial, <100 QPM)

Unit Economics — unchanged
  Blended margin at 1,000 users: 92%
  Annual: $99,528 profit on $107,990 revenue
  Break-even: ~10 paid users

Bot Channel Economics (REVISED Cycle 13 — dual-path + Discord)

  Optimistic (all 3 channels live by Week 3):
    Reddit (Devvit + PRAW): 50 summons/day x 100 views = 5,000 impressions/day
    Discord: 30 commands/day x 20 members = 600 impressions/day
    Total: 5,600 daily impressions
    At 1.5% CTR = 84 visits/day = 2,520/month
    At 35% usage, 10% Sleeper: ~88 connections/month
    At 15% trial, 20% conversion: ~2.6 new paid/month from bots

  Likely (Discord + Devvit live Week 2, PRAW pending):
    Reddit (Devvit only): 25 summons/day x 100 views = 2,500 impressions/day
    Discord: 20 commands/day x 20 members = 400 impressions/day
    Total: 2,900 daily impressions
    At 1.5% CTR = 44 visits/day = 1,320/month
    Conversion: ~1.3 new paid/month from bots

  Conservative (PRAW rejected, Devvit + Discord only):
    Reddit (Devvit, installed subs only): 15 summons/day x 100 views = 1,500 impressions/day
    Discord: 20 commands/day x 20 members = 400 impressions/day
    Total: 1,900 daily impressions
    At 1% CTR = 19 visits/day = 570/month
    Conversion: ~0.5 new paid/month
    Still net-positive at $0 cost

  NOTE: FPLbot engagement data not publicly available (searched extensively).
  These estimates are directional. Calibrate after first week of live data.

  Devvit Developer Funds 2026 (BONUS — new Cycle 13):
    If Devvit app installed in r/DynastyFF (192K) + r/fantasyfootball (3.4M):
    Both exceed 1,000-member threshold for "Qualified Install"
    Reddit pays developers per program terms (April 2025 - June 2026)
    Potential additional revenue stream — amount TBD by Reddit

Timeline — unchanged from Cycle 12
  Current users: 0
  Month 1 target: 50 site visits/day (bots + Twitter)
  Month 3 target: 100 registered users, 25 Sleeper connections
  Month 6 target: 50-100 paid users
  Month 12 target: 300-500 paid users
  Month 18 target: 1,000 paid users

  Key milestones (UPDATED Cycle 13):
    - Reddit accounts created (Week 1 — TODAY)
    - Reddit API application submitted (Week 1 — TODAY)
    - Discord bot live (Week 1-2 — FASTEST CHANNEL)
    - Devvit app published (Week 1-2 — NO API WAIT)
    - Devvit app installed by mods (Week 2-3 — DEPENDENT ON MOD RELATIONSHIP)
    - PRAW bot deployed (Week 2-4 — upon API approval)
    - Reddit account warm-up complete (Week 5)
    - Behavioral profiling reveal (Week 7) — PMF validation
    - NFL Draft (April 24) — peak content window
    - Tweet queue refill (by April 14)
    - Fantasy Wrapped ships (Jan 2027) — first viral opportunity
    - NFL season starts (Sep 2026) — peak engagement window
```

---

## RECOMMENDATION

**Cycle 13 solved the problem Cycle 12 discovered.** The Reddit API gating is no longer a single point of failure. The dual-path strategy (Devvit + PRAW) combined with Discord bot elevation gives Razzle three distribution channels that can be built this week at $0 cost.

**NO CYCLE 14.** This is the last time this is said, and this time the research truly is exhausted. Every remaining unknown requires execution:
1. Will mods install the Devvit app? (Answer: ask them)
2. Will Reddit approve the API application? (Answer: apply and find out)
3. Will behavioral profiling create WTP? (Answer: ship and test)
4. Will the bots get traction? (Answer: deploy and measure)

None of these can be answered by research. All four require building.

**The four highest-impact actions, in order:**
1. **Create Reddit accounts** (personal + bot — 10 minutes — starts age clock)
2. **Submit Reddit API application** (5 minutes — starts approval clock)
3. **Build and ship Discord bot** (fastest channel — zero approval, can be live in hours)
4. **Build and publish Devvit app** (second fastest — no API wait, mod installation is the only gate)

**Confidence in $100k revenue path: 6/10** (up from 5.5/10 in Cycle 12). The improvement comes from: dual-path eliminates API gating as single point of failure (+0.25), Discord bot adds zero-friction channel (+0.15), Devvit Developer Funds is a bonus opportunity (+0.1). Behavioral WTP remains the existential unknown (no change).

Sources:
- [FPLbot GitHub](https://github.com/amosbastian/FPLbot)
- [FFBot GitHub](https://github.com/Surye/FFBot)
- [Reddit Devvit GitHub](https://github.com/reddit/devvit)
- [Reddit Devvit Docs](https://github.com/reddit/devvit/blob/main/devvit-docs/docs/api/public-api/README.md)
- [Reddit Developer Funds 2026](https://support.reddithelp.com/hc/en-us/articles/27958169342996-Reddit-Developer-Funds-2026-Terms)
- [Devvit sub-stats-bot (reference Devvit app)](https://github.com/fsvreddit/sub-stats-bot)
- [Devvit Introduction (hashnode)](https://dragonejt.hashnode.dev/introduction-to-the-reddit-developer-platform)
- [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- [Reddit API pre-approval analysis (replydaddy)](https://replydaddy.com/blog/reddit-api-pre-approval-2025-personal-projects-crackdown)
- [Reddit API credentials guide 2025 (wappkit)](https://www.wappkit.com/blog/reddit-api-credentials-guide-2025)
- [Reddit killed self-service API keys (molehill.io — NOTE: sells competing product)](https://molehill.io/blog/reddit_killed_self-service_api_keys_your_options_for_automated_reddit_integration)
- [Reddit verified bot labels (CompsMag)](https://www.compsmag.com/news/reddits-verified-bot-revolution-a-new-era-for-brand-transparency-and-community-trust/)
- [Sleeper API docs](https://docs.sleeper.com/)
- [Dynasty Daddy Discord bot (top.gg)](https://top.gg/bot/1248312528686284965)
- [r/FantasyPL stats (subredditstats)](https://subredditstats.com/r/fantasypl) — 736K members
- [r/DynastyFF stats (subredditstats)](https://subredditstats.com/r/dynastyff) — 192K members
- [r/fantasyfootball stats (subredditstats)](https://subredditstats.com/r/fantasyfootball) — 3.4M members
- [Reddit bot building guide 2025 (wappkit)](https://www.wappkit.com/blog/how-to-build-reddit-bot-python-2025)
- [Sleeper review (Lines.com)](https://www.lines.com/dfs/sleeper-fantasy) — 5M MAUs
