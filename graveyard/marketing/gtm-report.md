# Razzle Go-To-Market Report — Cycle 15

**Generated**: 2026-03-23
**Previous Cycle**: 2026-03-23 (Cycle 14)
**Target**: 1,000 people paying ~$100/year = $100,000/year
**Status**: Pre-launch (Twitter active since 2026-03-20, site live at razzle.lol, 17 tweets posted, 41 approved in queue through April 23, 100+ rejected, zero engagement data yet)

**Cycle 15 thesis**: Cycle 14 confirmed Devvit trigger API and exposed Discord top.gg as a dead end. Cycle 15 stress-tests the remaining unknowns around bot execution mechanics and the Sleeper account connection funnel. Three findings: (1) **Devvit app installation mechanics fully mapped** — moderators install via "+add to community" button in the App Directory, available on iOS/Android/Desktop (NOT old Reddit). Full mod permissions required. The directory has "hundreds of apps" per Reddit's own community blog. The installation flow is low-friction for mods who already use Devvit tools. (2) **FPLbot engagement data confirmed non-existent for 3rd consecutive cycle** — no public summon counts, impression data, or CTR exist anywhere (GitHub, Steemit, Hive, PeakD, r/FantasyPL). The 50-summons/day estimate in virality math is permanently unanchored. Must calibrate from Razzle's own data in Week 1-2 of bot deployment. (3) **League Legacy discovered as new competitor in league sync space** — imports from Sleeper/ESPN/Yahoo/Fleaflicker, dynasty history focus, positioned similarly to leaguemate.fyi but with broader platform support. Reinforces: Bureau differentiation MUST be behavioral, not historical. Net assessment: execution mechanics are fully mapped. No technical unknowns remain. Every remaining unknown requires building, not researching. **This is the definitive final research cycle.**

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

### CYCLE 15 UPDATE

**One new minor competitor discovered: League Legacy.** League Legacy (leaguelegacy.io) imports from Sleeper/ESPN/Yahoo/Fleaflicker and provides dynasty league history views. Positioned similarly to leaguemate.fyi but with broader platform support (4 platforms vs 1). Free tool, no AI, no behavioral profiling. **Impact: LOW.** This is the 3rd free league-history tool (after leaguemate.fyi and DD's free tier). Bureau League History uniqueness remains at 2/10. Bureau behavioral profiling uniqueness unchanged at 10/10.

**Competitive landscape otherwise stable for 8th consecutive cycle.**

**Zero NFL/dynasty Reddit bots exist. 15th consecutive cycle.**

**BotRank (botrank.net) discovered** — Reddit bot ranking platform using Wilson score confidence intervals between "Good bot"/"Bad bot" votes. Useful for tracking !razzle community reception post-launch. Not a competitor — a measurement tool.

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
| **League Legacy** | **Full access** | **Free** | League history, franchise records, imports | Sleeper, ESPN, Yahoo, Fleaflicker | No | Unknown |
| **Sourcetable** | Limited credits | **$240/yr** Pro ($20/mo) | AI spreadsheet, 40+ data science libs, multi-sport | ESPN, Yahoo, Sleeper, Fantrax, CBS | **Yes — AI analytics** | Unknown |
| **Razzle** | Full Screener, Bureau summary | **$79.99/yr** (Pro), **$149.99/yr** (Elite) | 100+ stat screener, Bureau behavioral profiling, 6 AI agents, 70+ panels | Sleeper only | **Yes — behavioral AI** | **0** (pre-launch) |

### What Razzle STILL has that NO competitor has (15th consecutive cycle)

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
6. **Distribution channels** — Dynasty Daddy has 4 (Discord bot, Fantasy Wrapped, Patreon, Creator Tools). Razzle has Twitter (17 tweets posted, 41 queued). **Dual-path bot strategy (Devvit + PRAW + Discord) planned — see Section 7B.** Discord bot discovery via top.gg proven ineffective (see Section 7B-2).
7. **Reddit bot** — No dynasty bot exists on Reddit, and neither does Razzle's. Devvit dual-path eliminates API gating as blocker.

---

## Section 3: Brand Audit

*Unchanged from Cycle 11.*

### What's Working

1. **Visual identity is distinctive.** Warm sand/espresso/comic-strip aesthetic. Zero competitors look like this.
2. **Agent personas create content diversity.** Six characters = tweet variety. Creative quality 4-5/5.
3. **"Forever free" Screener positioning.** No competitor matches this depth at $0.
4. **"Other tools know your roster. Razzle knows your leaguemates."** 15th consecutive cycle confirmation.
5. **Twitter pipeline is actively posting.** 17 tweets posted. 41 approved in queue through April 23.
6. **Agent connective tissue design.** Agents woven across Lab/Bureau/Situation Room as personality layer.

### What's Still NOT Working

1. **Zero engagement data.** 17 tweets posted. Still no impressions, retweets, or follower data.
2. **No Reddit presence.** Zero posts, zero comments, zero karma. Account not yet created. **Day 4+ of Week 1.**
3. **One distribution channel (Twitter).** Three more planned (Devvit, PRAW, Discord) — none built yet. **Every day without Reddit accounts delays the age clock.**
4. **Bureau behavioral profiling not yet live.** The feature that IS the moat has not shipped.

---

## Section 4: Product-Market Fit Scorecard

| Feature | Demand | Uniqueness | Screenshot | WTP | Notes |
|---------|:---:|:---:|:---:|:---:|-------|
| **Screener (100+ columns)** | 7 | 5 | 9 | 2 | Growth engine. Forever free. |
| **Custom Formulas** | 5 | 7 | 7 | 3 | Formula Store unique. |
| **Bureau: League Odds** | 8 | 4 | 10 | 7 | DD has playoff sim. |
| **Bureau: Manager Profiles** | 7 | **10** | 8 | 7 | **THE MOAT.** 15th cycle. Zero competitors. |
| **Bureau: Trade Finder** | 8 | 4 | 7 | 6 | Multiple competitors. |
| **Bureau: Pressure Map** | 5 | **10** | 8 | 6 | Unique. Zero competitors. |
| **Bureau: League History** | 6 | 2 | 6 | 2 | leaguemate.fyi does this free. |
| **Situation Room (AI Agents)** | 7 | 5 | 7 | 4 | Dynasty-focused AI differentiated from multi-sport RotoBot 2.0. |
| **Agent Personas** | 4 | 10 | 6 | 3 | Brand glue. Twitter content value. |
| **Dynasty Rankings** | 8 | 3 | 5 | 4 | Commodity. |
| **PNG Export + Watermark** | 6 | 6 | 10 | 1 | Growth tool. Critical to flywheel. |
| **Reddit Bot (!razzle)** | 7 | **9** | N/A | 0 | **No dynasty/NFL Reddit bot exists. FPLbot (736K-member r/FantasyPL) proves model. Devvit trigger API confirmed. Devvit install mechanics mapped. 15th cycle open lane.** |
| **Fantasy Wrapped (proposed)** | 9 | 3 | **10** | 5 | DD proved this. Razzle adds behavioral angle. |
| **Discord Bot (proposed)** | 6 | 3 | N/A | 0 | DD bot has near-zero discovery on top.gg (0 votes, 9+ months). Direct distribution required. |

### PMF Changes — Cycle 15

**Reddit Bot notes updated.** Devvit install mechanics now fully mapped: mods use "+add to community" in the App Directory (iOS/Android/Desktop, NOT old Reddit). Full mod permissions required. This confirms the mod outreach strategy is the only gate — no technical barriers remain. FPLbot engagement data confirmed non-existent for 3rd cycle — virality math estimates are permanently directional.

**Bureau: League History uniqueness reconfirmed at 2/10.** League Legacy (leaguelegacy.io) is the 3rd free league-history tool, supporting 4 platforms (Sleeper/ESPN/Yahoo/Fleaflicker). Bureau non-behavioral features are increasingly commoditized. Behavioral profiling remains the only defensible moat at 10/10.

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

### Ranked by ROI (updated Cycle 15)

| Rank | Channel | Effort | Expected Return | Timeline | Status |
|------|---------|--------|----------------|----------|--------|
| 1 | **Reddit Bot (Devvit + PRAW dual-path)** | **Medium** | Very High | **1-3 weeks** | **NOT STARTED. Devvit trigger API confirmed. Install mechanics mapped. Dual-path eliminates SPOF. ALL TECHNICAL UNKNOWNS RESOLVED.** |
| 2 | **Discord Bot** | Low (200 lines) | **Medium** | **<1 week** | **Not started. Distribute via direct invite links, NOT top.gg. DD bot 0 votes after 9+ months.** |
| 3 | **Twitter** | Low (maintenance) | High | **Active** | **17 posted, 41 queued through April 23. WORKING.** |
| 4 | **Reddit (r/DynastyFF)** | High | Very High | 2-3 months | **Account NOT created. Day 4+ of Week 1. EVERY DAY OF DELAY = 1 DAY LESS AUTOMOD SAFETY.** |
| 5 | **League group chats** | Zero effort | High | Viral | Requires Bureau to be impressive. |
| 6 | **Reddit (r/fantasyfootball)** | Medium | High | 2-3 months | Same Reddit account. |
| 7 | **SEO** | Low | Medium | 3-6 months | 70+ pages = natural SEO surface. |
| 8 | **Fantasy Wrapped** | Medium (1 week) | Very High | Jan 2027 | DD proved viral. Plan with behavioral data. |
| 9 | **Content Creator partnerships** | Medium | Medium | 2-3 months | DD Creator Tools shows the model. |
| 10 | **Fantasy podcasts** | Medium | Medium | 1-3 months | Behavioral profiling = unique talking point. |
| 11 | **YouTube** | High | Medium | 3-6 months | After traffic exists. |
| 12 | **Paid ads** | High cost | Unknown | Not recommended | Only after organic working. |

### Section 7B: Reddit Bot Distribution Strategy — Confirmed Cycle 15

#### Cycle 15: Devvit Installation Mechanics Fully Mapped

Cycles 13-14 confirmed the Devvit trigger API and dual-path strategy. Cycle 15 maps the final unknown: how mods actually install Devvit apps.

**Devvit App Installation Flow** (from Reddit community blog + help center):
1. Developer publishes app via `devvit upload` + `devvit publish`
2. App appears in the **App Directory** (browsable on iOS/Android/Desktop — NOT old Reddit)
3. Moderator clicks **"+add to community"** button on the app listing
4. Mod grants necessary permissions and selects which communities to install in
5. Mod must have **full moderator permissions** to install or manage apps
6. Once installed, app appears under "Installed Apps" in community settings
7. The directory has **"hundreds of apps"** currently listed (per Reddit's own blog)

**Key implication**: The installation is a 3-click process for mods — lower friction than expected. The gate is mod willingness, not technical complexity. The 2-4 week participation period before outreach remains the correct strategy.

#### Devvit Trigger API (confirmed Cycle 14, unchanged):

**Confirmed Devvit trigger types** (from `@devvit/public-api`):
- `CommentSubmit` / `CommentCreate` — listen for new comments (the !razzle trigger)
- `CommentDelete` / `CommentUpdate` / `CommentReport`
- `PostSubmit` / `PostReport`
- `AppInstall` — fires when a mod installs the app

**The `addTrigger` method** registers event listeners:
```typescript
Devvit.addTrigger({
  event: 'CommentSubmit',
  onEvent: async (event, context) => {
    // Parse for "!razzle" prefix
    // Fetch from razzle.lol/api/*
    // Reply with markdown table
  }
});
```

This is not speculative — the API exists, is documented, and is used by production Devvit apps (sub-stats-bot, Modmail Automater, Trending Tattler, and hundreds of game/experience apps).

#### FPLbot Reference Implementation — Status Update (Cycle 15)

**FPLbot** (github.com/amosbastian/FPLbot): The definitive reference for a Reddit data bot.
- **GitHub stats**: 69 stars, 13 forks, 122 commits, 1 open issue, MIT license
- **Status**: Semi-active to dormant. May be affected by Reddit's November 2025 API key changes.
- **Stack**: Python 3.6+, PRAW, MongoDB, fpl library, Understat
- **Commands**: `!fplbot <player> vs. <team|player> <optional: fixtures>`
- **Player matching**: MongoDB text indexes with manual name mapping for fuzzy search
- **Response**: Markdown tables with stats (xG, xA, goals, assists, minutes, key passes)
- **Cron features**: Daily price change alerts posted automatically
- **Multi-platform**: Has a companion Slack/Discord version (fplbot.app) — validates multi-platform bot strategy
- **No public engagement stats** — **confirmed for 3rd consecutive cycle** (Cycles 13, 14, 15). Searched GitHub, Steemit dev blogs, Hive posts, PeakD, r/FantasyPL, Google Scholar. No summon counts, impression data, or CTR have EVER been published by the developer or any third party. **This data does not exist publicly.** The virality math (50 summons/day) is an estimate that can ONLY be calibrated from Razzle's own deployment data.
- **Key insight**: FPLbot's dormant state + absence of engagement data means Razzle cannot benchmark against FPLbot. The !razzle bot must generate its own benchmarks in Week 1-2 of deployment. Plan for instrumented logging from day one: summon count, unique users, player queries, click-through on razzle.lol links.

**Sources**: [FPLbot GitHub](https://github.com/amosbastian/FPLbot), [FPLbot dev blog on Hive](https://hive.blog/fpl/@amosbastian/adding-new-features-to-my-fpl-bot-for-reddit), [fplbot.app (Slack/Discord)](https://www.fplbot.app/)

#### BotRank — Post-Launch Measurement Tool (Cycle 15 NEW)

**BotRank** (botrank.net): Reddit bot ranking platform using Wilson score confidence intervals between "Good bot" / "Bad bot" community votes. Tracks karma, vote ratios, and community reception over time. Filterable by day/week/month/year.

**Action**: After !razzle bot is live, monitor BotRank ranking as a proxy for community reception. "Good bot" votes indicate the bot is adding value to threads. "Bad bot" votes indicate spam perception or poor response quality.

#### Reddit API Status (unchanged from Cycle 13)

Reddit API gating is REAL but less severe than Cycle 12 assumed:
- Self-service API keys discontinued November 2025 — confirmed
- Pre-approval required via Developer Support form — confirmed
- Target response time: **7 days** (Reddit's stated target)
- **Personal projects with low volume are still approved for free** — confirmed by multiple sources
- "Rarely approved" language came from molehill.io, which **sells an alternative Reddit integration product** — conflict of interest noted
- Existing OAuth credentials from before November 2025 still work
- Non-OAuth public JSON endpoints (~10 RPM) remain available without credentials

#### Reddit Developer Funds 2026 — EXACT NUMBERS (Cycle 14 NEW)

Previous cycles noted the Developer Funds as a "potential revenue stream — amount TBD." Cycle 14 found the exact terms:

**Program**: April 1, 2025 — June 30, 2026
**Eligible**: Devvit apps creating Experiences and Mod Tools. Max 3 apps per developer.

**Payout milestones**:
| Milestone | Payout | Type |
|-----------|--------|------|
| 500 Daily Qualified Engagers during any 14-day window | **$500** | One-time |
| 250 Qualified Installs during the program term | **$1,000** | One-time |

**Separate Developer Program** (ongoing, not time-limited):
- Developers earn **$0.01 per 1 Reddit gold** used by redditors on Devvit goods within their apps
- Minimum payout: $10
- **Irrelevant for !razzle** — a data bot doesn't sell goods. This revenue stream applies to games/experiences with in-app purchases.

**Assessment**: The Developer Funds payouts are **modest** ($500-$1,000 one-time). This is ecosystem validation, NOT meaningful revenue. The real value of Devvit is free hosting + Reddit's endorsement + bypassing API approval. The money is a bonus, not a strategy.

**Sources**: [Reddit Developer Funds 2026 Terms](https://support.reddithelp.com/hc/en-us/articles/27958169342996-Reddit-Developer-Funds-2026-Terms), [Reddit Developer Program](https://support.reddithelp.com/hc/en-us/articles/30641905617428-Developer-Program)

#### Bot Labels (unchanged from Cycle 12)

CEO Steve Huffman announced mandatory "Verified Bot" labels (February 2026). Net-positive for !razzle — adds legitimacy.

#### Risk Assessment (unchanged from Cycle 13, re-confirmed Cycle 14)

| Scenario | Likelihood | Impact | Mitigation |
|----------|-----------|--------|-----------|
| PRAW API approved + Devvit app installed | **Medium** (40-50%) | Best case — both paths active | Build both. |
| PRAW API approved, Devvit not installed by mods | **Medium** (30-40%) | Good — PRAW path sufficient | PRAW works across any subreddit. |
| PRAW API rejected, Devvit installed by mods | **Medium** (30-40%) | Good — Devvit path sufficient | Devvit bypasses API gating entirely. |
| Both paths blocked | **Low** (10-15%) | High | Public JSON read + manual posting. Discord bot as primary. |

**Net assessment**: Probability of at least one bot path working = **85-90%** (unchanged from Cycle 13).

#### Revised Bot Strategy (unchanged from Cycle 13) — Dual-Path

**Path A: PRAW (Python — familiar stack)**
1. Create bot Reddit account
2. Submit Developer Support form — non-commercial community tool
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

**Build BOTH in parallel.** Path B (Devvit) is likely faster. Path A (PRAW) is more flexible.

**Reference implementations:**
- **FPLbot** ([GitHub](https://github.com/amosbastian/FPLbot)): Python + PRAW + MongoDB. 69 stars. Semi-active. Commands: `!fplbot <player> vs. <team|player>`. Companion Slack/Discord version.
- **FFBot** ([GitHub](https://github.com/Surye/FFBot)): Python + PRAW. r/fantasyfootball WDIS threads.
- **sub-stats-bot** ([GitHub](https://github.com/fsvreddit/sub-stats-bot)): Devvit app. Reference for trigger + reply pattern.

#### Section 7B-2: Discord Bot — DISCOVERY PROBLEM IDENTIFIED (Cycle 14 REVISED)

**CYCLE 14 FINDING: top.gg is a dead end for fantasy football Discord bots.**

| Bot | Months Live | top.gg Votes | top.gg Reviews | Server Count |
|-----|-----------|-------------|---------------|-------------|
| **Dynasty Daddy** | **9+ months** (since Jun 2024) | **0** | **0** | **Not displayed** |
| **Sleeper Link** | Active | **0** | **1** (4/5 stars) | **Not displayed** |
| **Sleeper-FFL** | Active | **0** | **2** (5/5 stars) | **Not displayed** |
| **Only dynasty-tagged bot on all of top.gg** | — | — | — | **Dynasty Daddy (1 total)** |

**What this means**: Listing on top.gg does NOT generate discovery for fantasy football bots. Zero fantasy football bot on top.gg has meaningful votes or reviews. Users don't browse top.gg looking for dynasty tools — they find bots through community recommendations.

**REVISED Discord distribution strategy** (Cycle 14):

~~List on top.gg for discovery~~ → top.gg listing is a checkbox, not a channel.

**Actual distribution paths for the Discord bot:**
1. **Share bot invite link in Reddit comments** — "I built a bot that does this, here's the link" (after credibility is established)
2. **Pin bot invite in Twitter bio/thread** — every tweet about the bot includes the invite
3. **Post in fantasy football Discord servers directly** — r/DynastyFF Discord, Dynasty Nerds Discord, league-specific servers
4. **Bot responses include "Add to your server" link** — every command response is a funnel to more servers
5. **Reddit bot cross-promotes Discord bot** — !razzle responses include "Also on Discord" footer

**Discord bot remains Rank #2 channel** despite discovery revision because:
- Zero API gating, zero mod installation, zero approval wait — fastest to deploy
- Direct invite links bypass top.gg entirely
- League Discord servers are where trade discussions happen in real-time
- FPLbot validated multi-platform (Reddit + Discord + Slack) as the correct pattern

**Dynasty Daddy bot commands (competitive intelligence)**:
| Command | What it does |
|---------|-------------|
| `/marketvalue` | Fetch current player market value |
| `/trades` | Create trade polls using league + market data |
| `/tradeinfo volume` | Most traded players from past week |
| `/tradeinfo player` | Trade information for specific player |

**Razzle Discord bot differentiation** (must exceed DD's 4 commands):

| Command | Response | DD has? | Funnel Hook |
|---------|---------|:---:|-------------|
| `/razzle player [name]` | PPR PPG, target share, snap %, age, dynasty value | Similar | "Full profile at razzle.lol" |
| `/razzle compare [A] vs [B]` | Side-by-side stat table | No | "Compare tool at razzle.lol" |
| `/razzle prospect [name]` | Draft pos, college stats, combine | No | "Scouting report at razzle.lol" |
| `/razzle breakouts` | Top 5 breakout candidates | No | "Full finder at razzle.lol" |
| `/razzle trade [A] for [B]` | Value comparison, verdict | Similar | "Trade analyzer at razzle.lol" |
| `/razzle buysell` | Top buy-low / sell-high candidates | No | "Full list at razzle.lol" |

**Sources**: [Dynasty Daddy bot on top.gg](https://top.gg/bot/1248312528686284965), [Sleeper Link on top.gg](https://top.gg/bot/1043588265372024922), [Sleeper-FFL on top.gg](https://top.gg/bot/871087848311382086), [top.gg dynasty tag](https://top.gg/tag/dynasty)

#### Proposed Commands (unchanged, confirmed viable)

| Command | API Endpoint | Response | Funnel Hook |
|---------|-------------|---------|-------------|
| `!razzle Bijan Robinson` | `/api/players` | PPR PPG, target share, snap %, age | "Full profile at razzle.lol" |
| `!razzle compare A vs B` | 2x `/api/players` | Side-by-side table | "Compare tool at razzle.lol" |
| `!razzle prospect [name]` | `/api/players` (college) | Draft pos, college stats, combine | "Scouting report at razzle.lol" |
| `!razzle breakouts` | `/api/breakout-candidates` | Top 5 breakout candidates | "Full finder at razzle.lol" |
| `!razzle trade A for B` | `/api/trade-value-chart` | Value comparison, verdict | "Trade analyzer at razzle.lol" |

#### Virality Math (unchanged from Cycle 13)

**NOTE**: No public benchmark data exists for FPLbot engagement (confirmed 2nd cycle). These estimates are directional, not empirical.

**Optimistic (Devvit + PRAW both live by Week 3):**
- Reddit: 50 summons/day x 100 views = 5,000 daily impressions
- Discord: 30 commands/day x 20 members = 600 daily impressions
- Total: 5,600 daily impressions
- At 1.5% CTR = 84 visits/day = 2,520/month
- Cost: $0/mo

**Likely (Devvit live Week 2, PRAW pending):**
- Reddit (Devvit only): 25 summons/day x 100 views = 2,500 daily impressions
- Discord: 20 commands/day x 20 members = 400 daily impressions
- Total: 2,900 daily impressions
- At 1.5% CTR = 44 visits/day = 1,320/month

**Conservative (PRAW rejected, Devvit only):**
- Reddit (installed subreddits only): 15 summons/day x 100 views = 1,500 daily impressions
- At 1% CTR = 15 site visits/day = 450/month
- Still net-positive at $0 cost

#### Key Precedent: FPLbot Proves the Pattern (updated Cycle 15)

FPLbot (github.com/amosbastian/FPLbot) is the reference implementation for a Reddit data bot:
- **Built for r/FantasyPL** — **736K members**. 3.8x the size of r/DynastyFF (192K).
- **Stack**: Python 3.6+, PRAW, MongoDB, fpl library, Understat
- **GitHub**: 69 stars, 13 forks, 122 commits, MIT license
- **Status**: Semi-active to dormant — likely affected by Reddit's November 2025 API key changes
- **Commands**: `!fplbot <player> vs. <team|player> <optional: fixtures>`
- **Multi-platform**: fplbot.app serves Slack and Discord — validates building for Reddit + Discord simultaneously
- **No public engagement stats** — **confirmed non-existent across 3 cycles** (13, 14, 15). Searched GitHub issues, Steemit dev blogs (2018-2019), Hive posts, PeakD, r/FantasyPL, Google Scholar. The developer never published usage metrics. No third party has measured or reported them. **This data gap is permanent, not a research gap.** The virality math MUST be calibrated from Razzle's own data.

**Razzle's advantage over FPLbot**: FPLbot serves a single sport (soccer) with limited FPL API data. Razzle has 100+ stat columns, college data, prospect data, trade values, breakout scores, and 70+ analytical panels to funnel users toward. Each bot response is a door into a much deeper product. FPLbot has no monetization funnel — it's purely a community tool. !razzle links back to razzle.lol on every response.

**FPLbot's dormant state is an opportunity signal.** The PRAW-based Reddit bot pattern struggles under new API restrictions. A Devvit-native approach is the modernized successor. Razzle doesn't need to copy FPLbot — it needs to be what FPLbot would be if built today on Reddit's current platform.

**FFBot** (github.com/Surye/FFBot): WDIS thread bot on r/fantasyfootball. Uses FantasyPros rankings. Status unclear — GitHub exists but no confirmed 2025-2026 activity. Even if active, it only serves WDIS (who do I start) — no player data lookup, no dynasty analytics. Not a competitor; validates the pattern that r/fantasyfootball accepts bots.

**No NFL/dynasty data lookup bot exists on Reddit.** This is the open lane. **15th consecutive cycle confirmation.**

---

## Section 7C: Sleeper Account Connection + Reddit Account Connection Strategy (updated Cycle 15)

The ROADMAP describes two account connection pillars:
- **Sleeper connection** (existing) — already built. No OAuth needed. Read-only API, no auth, 1,000 RPM.
- **Reddit connection** (Phase 3C, May 15-31) — OAuth required. Reads comment history for intent analysis.

### Sleeper API: The Frictionless Funnel (Cycle 15 deep dive)

The Sleeper API is Razzle's biggest distribution advantage that ISN'T the bot:

**Why Sleeper API matters for GTM:**
1. **Zero auth friction** — no OAuth, no API key, no user consent flow. Just enter a Sleeper username and Razzle can pull leagues, rosters, transactions, draft picks, and matchups instantly.
2. **This is rare.** Yahoo requires OAuth 1.0. ESPN requires OAuth 2.0. NFL.com requires OAuth 2.0. Only Sleeper lets a third-party tool pull league data with ZERO authentication. This means the Sleeper connection moment is instant — no "authorize this app" screen, no redirect flow, no friction.
3. **The connection moment IS the conversion funnel.** User enters Sleeper username → sees their league odds (free) → sees lock icons on Self-Scout, Pressure Map, Manager Profiles → starts trial → converts.
4. **Multiple third-party tools already use this pattern**: Dynasty Daddy (7 platforms but Sleeper is primary), leaguemate.fyi (Sleeper only), League Legacy (4 platforms including Sleeper), Dynasty Dealmaker (Sleeper only), KeepTradeCut (Sleeper + MFL). The Sleeper-first strategy is validated by every dynasty tool in the market.
5. **MCP integration exists** — Anthropic's Model Context Protocol has a Sleeper API MCP server (langdb.ai). This validates the AI-agent-reads-your-league pattern. Razzle's Situation Room does this natively.

**Sleeper user base**: 5M MAUs (Lines.com 2026). Estimated 1.5-2.5M dynasty managers. Razzle needs 1,000 paid from this pool = 0.04-0.07%. Achievable.

**What Razzle does that other Sleeper-connected tools don't:**
- Behavioral profiling from multi-season transaction history (unique)
- Pressure maps / desperation scoring (unique)
- AI agents with full league context injection (unique — RotoBot/FantasyFootball.ai have league AI but no behavioral layer)
- Manager personality analysis (unique)

### Reddit API: OAuth Required (unchanged)
For Reddit account connection (reading user comment history), Reddit OAuth IS required. One API application covers both bot + account connection.

### Recommendation
**Defer Reddit account connection to Phase 3C (May 15-31) as planned.** Build the bot first (simpler, higher immediate ROI). The Sleeper connection is already built and working — the bot's job is to drive users to razzle.lol where the Sleeper connection creates the conversion moment.

**Sources**: [Sleeper API docs](https://docs.sleeper.com/), [Sleeper API guide (Zuplo)](https://zuplo.com/learning-center/sleeper-api), [Sleeper API MCP (LangDB)](https://langdb.ai/app/mcp-servers/sleeper-api-mcp-2bef2d2b-8e7c-48d3-bdc1-53c6318c61e1)

---

## Section 8: 8-Week Launch Plan (REVISED Cycle 15 — Week 1 DAY 4+)

### Week 1 (March 21-27): Dual-Path Bot + Reddit Accounts — DAY 4+ — BEHIND SCHEDULE

- [x] Twitter pipeline functional — 41 approved tweets queued
- [x] 17 tweets posted (7 evidence, 5 community, 3 agent verdicts, 2 mascot)
- [ ] **CREATE REDDIT ACCOUNT** — u/DynastyDataNerd. **CRITICAL: March 23 creation = 30 days old by April 22.** Verify email+phone+2FA for CQS boost. **THIS IS A 10-MINUTE TASK. DO IT NOW.**
- [ ] **CREATE BOT REDDIT ACCOUNT** — separate account (u/razzle_bot or similar). **5 minutes.**
- [ ] **APPLY FOR REDDIT API ACCESS** — Submit Developer Support form. Non-commercial community tool, low volume. 7-day target response. **5 minutes.**
- [ ] **BUILD DEVVIT APP** — `npx devvit new razzle-bot`. CommentSubmit trigger (CONFIRMED — Cycle 14-15 verified exact API + install mechanics). TypeScript. **FASTER PATH — no API approval wait. Mods install via "+add to community" in App Directory (3-click process).**
- [ ] **BUILD PRAW BOT** — ~200 lines Python. FPLbot as reference. Ready to deploy upon API approval. **Instrument from day one: log summon count, unique users, player queries, CTR on razzle.lol links.** No FPLbot benchmark exists (confirmed 3 cycles) — must generate own.
- [ ] **BUILD DISCORD BOT** — discord.py, ~200 lines. Same API endpoints. **Distribute via direct invite links ONLY.** top.gg is dead for fantasy (DD: 0 votes, 9+ months).
- [ ] Follow 50-100 fantasy football accounts on Twitter
- [ ] Engage in 5-10 dynasty Twitter threads per day
- **Measure**: Reddit accounts created, API application submitted, Devvit app scaffolded, Discord bot functional, Twitter followers, **bot instrumentation logging active**
- **URGENCY**: Every day of delay reduces automod safety margin. March 23 = 32 days before April 24 Draft. Account needs 30+ days of age for most subreddit automods.

### Week 2 (March 28 - April 3): Reddit Warm-Up + Bot Deployment

- [ ] Reddit warm-up begins — 3-5 helpful comments/day on r/fantasyfootball
- [ ] **DISCORD BOT LIVE** — deploy to Render. **Distribute invite link via Twitter + Reddit comments, NOT top.gg.**
- [ ] **DEVVIT APP LIVE** — `devvit upload` + `devvit publish`. Message r/DynastyFF and r/fantasyfootball mods to install. Frame as value-add: "Free player data lookup for your community."
- [ ] PRAW bot code complete and tested locally
- [ ] Follow up on API application if no response
- [ ] Twitter: ~2 tweets/day from queue (auto-posting)
- **Measure**: Reddit karma, Discord bot direct invites (NOT top.gg votes), Devvit mod installation status, API application status

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
- **Measure**: Twitter followers, Reddit karma, bot summons by channel, Discord servers (via direct invites)

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

| # | Risk | Likelihood | Impact | Mitigation | Cycle 14 Update |
|---|------|-----------|--------|-----------|----------------|
| 1 | ~~Twitter pipeline broken~~ | **RESOLVED** | — | — | **RESOLVED since Cycle 9.** |
| 2 | **Distribution gap vs Dynasty Daddy** | **HIGH** | Very High | Build Reddit bot + Discord bot. | **Partially mitigated. DD Discord bot has near-zero top.gg discovery (0 votes, 9 months). Their distribution advantage is less than assumed on Discord.** |
| 3 | **AI competitive landscape crowding** | **MEDIUM** | High | Lead with behavioral. | **Stable 7th cycle.** |
| 4 | **Sleeper-only + web-only** | **HIGH** | Very High | Desktop 43% cite analytics. Sleeper 5M MAUs. | **Unchanged.** |
| 5 | **RotoBot price competition** | **LOW-MEDIUM** | Medium | Differentiate on features, not price. | **Unchanged.** |
| 6 | **Zero traction on any channel** | Medium | High | Bot channels = passive distribution. | **THREE bot channels planned. top.gg dead end for discovery — direct distribution required.** |
| 7 | **Reddit mods remove bot** | Medium | High | Build history first. Bot adds value. | **Devvit apps are mod-installed. 2-4 weeks genuine participation before outreach recommended.** |
| 8 | **Behavioral profiling is "nice to have"** | **MEDIUM** | **Critical** | Footballguys validates concept. 14 cycles, zero competitors. | **Unchanged. Existential unknown. Week 7 test.** |
| 9 | **Elite tier API costs** | **LOW** | Low | DeepSeek at $0.005/query. 96% margin. | **Unchanged.** |
| 10 | **Solo founder burnout** | Medium | High | Automate pipeline. Claude Code force multiplier. | **Unchanged.** |
| 11 | **Price sensitivity — DN $49.99 undercuts** | **MEDIUM** | Medium | Must justify premium through behavioral. | **Unchanged.** |
| 12 | **Competitor adds behavioral profiling** | Low-Med | Very High | Move fast. Ship first. Data compounds. | **15th cycle: zero competitors in behavioral space.** |
| 13 | **Reddit bot rate-limited or banned** | Low | Medium | PRAW manages limits. Explicit summons only. | **Devvit apps are rate-managed by Reddit itself.** |
| 14 | **leaguemate.fyi + League Legacy commoditize Bureau history** | **MEDIUM-HIGH** | Medium | Bureau must lead on behavioral. | **League Legacy (leaguelegacy.io) discovered Cycle 15 — 3rd free league-history tool. 4-platform support (Sleeper/ESPN/Yahoo/Fleaflicker). Reinforces: behavioral is the only defensible moat.** |
| 15 | **Dynasty Daddy distribution moat widens** | **MEDIUM** (revised DOWN) | High | Build Reddit + Discord bots. | **REVISED DOWN. DD Discord bot has 0 votes after 9 months on top.gg. Their distribution advantage on Discord is weaker than assumed.** |
| 16 | **RotoBot scales to mainstream** | **LOW** | Low | RotoBot 2.0 going multi-sport. Less dynasty focus. | **Unchanged.** |
| 17 | **Enterprise AI enters fantasy** | **LOW** | Low | Sourcetable targets data scientists. | **Unchanged.** |
| 18 | **Market maturation limits ceiling** | **LOW** | Low | Growth from depth, not breadth. Favors tools. | **Unchanged.** |
| 19 | **Reddit API access denied for bot** | **LOW-MEDIUM** | **Medium** | Devvit completely bypasses this risk. PRAW rejection no longer blocks bot strategy. | **Unchanged from Cycle 13.** |
| 20 | **Reddit API approval delayed past Draft Week** | **MEDIUM** | **Low-Medium** | Devvit app can be live BEFORE API approval arrives. Discord bot has zero approval wait. | **Unchanged.** |
| 21 | **Reddit bot labeling requirement** | **LOW** | **Low-Positive** | Verified bot label adds legitimacy. | **Unchanged.** |
| 22 | **Devvit app not installed by mods** | **MEDIUM** | **Medium** | Build mod relationship first. Frame as value-add. PRAW works independently. | **Best practice: 2-4 weeks genuine participation before outreach. Transparency about purpose.** |
| 23 | **Three-bot maintenance burden** | **LOW-MEDIUM** | **Low** | All hit same Razzle API. Logic lives in API, bots are thin wrappers. ~200 lines each. | **Unchanged.** |
| 24 | **Discord bot invisible without direct distribution** | **MEDIUM** | **Medium** | top.gg has near-zero organic discovery for fantasy football bots (all existing bots: 0 votes). Must distribute Discord bot invite link through Reddit comments, Twitter posts, and direct server outreach. top.gg listing is a checkbox, not a channel. |
| 25 | **Research-to-execution ratio is 15:0** | **HIGH** (NEW) | **Very High** | **NEW RISK (Cycle 15).** 15 research cycles completed. Zero Reddit accounts created. Zero bots built. Zero API applications submitted. The research is excellent but worthless without execution. NFL Draft is 32 days away. Every day of delay compounds. Mitigation: stop researching, start building. This is the FINAL research cycle. |

---

## Section 10: Cycle Delta

### Key Changes From Cycle 14

1. **Devvit app installation mechanics fully mapped.** Mods install via "+add to community" button in the App Directory (iOS/Android/Desktop, NOT old Reddit). Full mod permissions required. Directory has "hundreds of apps." Installation is a 3-click process — lower friction than expected. The gate is mod willingness (addressed by 2-4 week participation strategy), not technical complexity.

2. **FPLbot engagement data confirmed permanently non-existent (3rd consecutive cycle).** Searched GitHub issues, Steemit dev blogs, Hive posts, PeakD, r/FantasyPL, Google Scholar across Cycles 13-15. The developer never published usage metrics. No third party has measured them. This is NOT a research gap — this data was never created. The virality math (50 summons/day) can ONLY be calibrated from Razzle's own deployment data. **Action: instrument bot logging from day one.**

3. **League Legacy discovered as new minor competitor.** leaguelegacy.io imports from Sleeper/ESPN/Yahoo/Fleaflicker. Dynasty history views. Free, no AI, no behavioral profiling. This is the 3rd free league-history tool alongside leaguemate.fyi and DD's free tier. Bureau League History uniqueness remains 2/10. Behavioral moat unchanged at 10/10.

4. **BotRank (botrank.net) discovered as post-launch measurement tool.** Reddit bot ranking platform using Wilson score confidence intervals. Tracks "Good bot"/"Bad bot" community votes. Useful for monitoring !razzle community reception after deployment.

5. **Sleeper API frictionless funnel analyzed in depth.** Zero auth required — unique among fantasy platforms (Yahoo/ESPN/NFL.com all require OAuth). The Sleeper connection moment is instant and frictionless. Multiple competitors validate this pattern (DD, leaguemate.fyi, League Legacy, Dynasty Dealmaker, KTC). Sleeper MCP server exists (LangDB) — validates AI-reads-your-league pattern.

6. **FFBot (r/fantasyfootball WDIS bot) status mapped.** GitHub exists (Surye/FFBot). Status unclear for 2025-2026. Only serves WDIS threads — no player data lookup. Not a competitor but validates that r/fantasyfootball accepts bots.

7. **Zero NFL/dynasty Reddit bots exist — 15th consecutive cycle.** No new entrants.

8. **No new major competitors discovered.** 8th consecutive cycle with stable landscape. League Legacy is minor.

### Strategic Priorities (Cycle 15 — FINAL)

1. **Create Reddit accounts** — TODAY. Personal + bot. 10 minutes total. Starts age clock. **Non-negotiable. This is the highest-leverage 10 minutes in the entire GTM plan.**
2. **Submit Reddit API application** — TODAY. 5 minutes. Starts approval clock. Non-commercial community tool.
3. **Build Devvit app** — SHIP FIRST among bots. CommentSubmit trigger confirmed. Install mechanics mapped (3-click for mods). **Instrument from day one: summon count, unique users, player queries, CTR.** No FPLbot benchmark exists — must generate own.
4. **Build Discord bot** — SHIP SECOND. Zero friction deployment. Distribute via direct invite links in Reddit/Twitter/Discord servers, NOT top.gg.
5. **Build PRAW bot** — IN PARALLEL. Deploy when API approved. FPLbot as reference.
6. **Ship Bureau behavioral profiles** — THE MOAT. Must be live before Week 7 reveal (May 2-8). 39 days away.
7. **Monitor Twitter engagement** — 17 tweets posted. Still zero engagement data.
8. **Refill tweet queue** — 41 approved through April 23. Depletes by ~April 14 at 2/day.

### The honest assessment (Cycle 15 — FINAL)

**This cycle found incremental tactical value and closed the last execution unknowns. The research is now definitively complete.**

The Devvit installation mechanics mapping is the most useful new finding — confirming that mod installation is a 3-click process, not a complex workflow. This lowers the perceived barrier for mod outreach. Combined with the Cycle 14 trigger API confirmation, the entire Devvit path is now mapped end-to-end: build → publish → mods install via App Directory → CommentSubmit triggers → bot replies with data → razzle.lol link in every response.

The FPLbot engagement data non-existence is now definitively confirmed across 3 cycles. Stop looking. Instrument !razzle's own logging from day one and generate proprietary benchmark data.

League Legacy is a minor addition to the competitive landscape — the 3rd free league-history tool. It reinforces what Cycles 5-14 already established: Bureau differentiation MUST be behavioral.

**The four things that will determine if Razzle reaches 1,000 paid users (unchanged from Cycle 14 — stable for 2 cycles):**
1. Does behavioral profiling create "I need this" moments? (untested — requires shipping + Week 7 reveal)
2. Can distribution channels drive enough traffic? (technical path fully mapped — execution dependent)
3. Does the Screener create viral screenshots during Draft season? (untested — April 24 is 32 days away)
4. Can a solo founder execute fast enough? (execution dependent — 15 cycles of research, 0 cycles of bot building)

**The THREE actions that matter most today (March 23 — UNCHANGED FROM CYCLE 14):**

1. **Create Reddit accounts** (personal + bot) — 10 minutes. Starts age clock. **STILL NOT DONE.**
2. **Submit Reddit API application** — 5 minutes. Starts approval clock. **STILL NOT DONE.**
3. **Start building Devvit app** — ship first, instrument everything, contact mods when participation history exists.

**The opportunity cost of one more research cycle is real.** 15 cycles have been run. The competitive landscape has been stable for 8 cycles. The bot technical path is fully mapped. The behavioral moat is confirmed unique for 15 cycles. The Sleeper API frictionless funnel is validated by every competitor in the market. The only unknowns left are unknowns that require BUILDING: will users engage the bot? Will mods install the Devvit app? Will behavioral profiling create WTP? Will the Screener screenshots go viral during Draft week? None of these can be answered by another web search. They can only be answered by shipping code.

---

## CRITIQUE

### Self-Review Flags

**Section 7B (Reddit Bot Strategy):**
- [CONFIRMED] Devvit trigger API validated (Cycle 14) + install mechanics mapped (Cycle 15). End-to-end path fully known. Zero technical unknowns.
- [CONFIRMED] FPLbot engagement data does not exist publicly. 3rd consecutive cycle. Stop searching. Instrument own logging.
- [NEEDS ACTION] Bot account + personal account STILL not created. API application STILL not submitted. **Day 4+ of Week 1. 15 research cycles completed, 0 accounts created.**

**Section 7B-2 (Discord Bot):**
- [REALITY CHECK] Discord bot "Rank #2" maintained with "Medium" return. Direct distribution (not top.gg) is the only path. This is workable but adds effort.

**Section 7C (Sleeper Account Connection):**
- [CONFIRMED] Sleeper API remains frictionless (zero auth, 1K RPM). Multiple competitors validate the pattern. MCP integration exists.
- [DEFERRED] Reddit OAuth for account connection — Phase 3C (May 15-31). Correctly deferred.

**Section 8 (Launch Plan):**
- [REALITY CHECK] Week 1 scope: THREE bot codebases + two Reddit accounts + API application. Day 4+. Zero items started. **The research-to-execution ratio is 15:0.** This is the most urgent flag in the entire report.

**Section 2 (Competitive Landscape):**
- [NEW] League Legacy discovered. Minor — 3rd free league-history tool. No strategic impact.

### Flags Summary: 5 total
- 1 NEEDS DATA (DD ad revenue — perpetually unfixable, low priority)
- 2 REALITY CHECK (Discord bot Rank #2 with discovery problem; Week 1 scope vs Day 4+ execution — **CRITICAL**)
- 1 NEEDS ACTION (create accounts + submit API application — **15th cycle pending, unchanged**)
- 1 DEFERRED (Reddit OAuth for account connection — Phase 3C)
- 4 CONFIRMED (Devvit end-to-end, FPLbot data gap permanent, Sleeper API frictionless, FFBot pattern validates r/fantasyfootball accepts bots)

---

## FINANCIAL MODEL

```
RAZZLE FINANCIAL MODEL — CYCLE 14 (UPDATED)
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

Bot Channel Economics (REVISED Cycle 14 — Discord discovery problem)

  Optimistic (all 3 channels live by Week 3):
    Reddit (Devvit + PRAW): 50 summons/day x 100 views = 5,000 impressions/day
    Discord: 30 commands/day x 20 members = 600 impressions/day
    Total: 5,600 daily impressions
    At 1.5% CTR = 84 visits/day = 2,520/month
    At 35% usage, 10% Sleeper: ~88 connections/month
    At 15% trial, 20% conversion: ~2.6 new paid/month from bots

  Likely (Discord + Devvit live Week 2, PRAW pending):
    Reddit (Devvit only): 25 summons/day x 100 views = 2,500 impressions/day
    Discord (REVISED — lower without top.gg discovery): 10 commands/day x 15 members = 150 impressions/day
    Total: 2,650 daily impressions
    At 1.5% CTR = 40 visits/day = 1,200/month
    Conversion: ~1.2 new paid/month from bots

  Conservative (PRAW rejected, Devvit + Discord only):
    Reddit (Devvit, installed subs only): 15 summons/day x 100 views = 1,500 impressions/day
    Discord (direct distribution only): 5 commands/day x 10 members = 50 impressions/day
    Total: 1,550 daily impressions
    At 1% CTR = 16 visits/day = 480/month
    Conversion: ~0.5 new paid/month
    Still net-positive at $0 cost

  NOTE: FPLbot engagement data confirmed NON-EXISTENT (3rd consecutive cycle — Cycles 13-15).
  Discord estimates revised DOWN from Cycle 13 due to top.gg discovery failure.
  These estimates are PERMANENTLY directional. Calibrate from Razzle's own bot instrumentation data.
  REQUIRED: Log summon count, unique users, player queries, CTR on razzle.lol links from day one.

  Devvit Developer Funds 2026 (QUANTIFIED Cycle 14):
    500 Daily Qualified Engagers in 14-day window: $500 one-time
    250 Qualified Installs during program: $1,000 one-time
    Maximum bonus: $1,500 (both milestones met)
    Assessment: Modest. Not a revenue strategy. Ecosystem validation.

Timeline — unchanged from Cycle 12
  Current users: 0
  Month 1 target: 50 site visits/day (bots + Twitter)
  Month 3 target: 100 registered users, 25 Sleeper connections
  Month 6 target: 50-100 paid users
  Month 12 target: 300-500 paid users
  Month 18 target: 1,000 paid users

  Key milestones (UPDATED Cycle 15 — FINAL):
    - Reddit accounts created (Week 1 — STILL NOT DONE. Day 4+. 15 cycles.)
    - Reddit API application submitted (Week 1 — STILL NOT DONE)
    - Devvit app published (Week 1-2 — trigger CONFIRMED, install mechanics MAPPED)
    - Discord bot live (Week 1-2 — distribute via DIRECT LINKS, not top.gg)
    - Devvit app installed by mods (Week 2-3 — "+add to community" 3-click process, needs participation first)
    - PRAW bot deployed (Week 2-4 — upon API approval)
    - Bot instrumentation dashboard (Week 2 — summon count, unique users, player queries, CTR)
    - Reddit account warm-up complete (Week 5)
    - Behavioral profiling reveal (Week 7) — PMF validation
    - NFL Draft (April 24) — peak content window, 32 days away
    - Tweet queue refill (by April 14)
    - BotRank monitoring (post-bot-launch) — community reception tracking
    - Fantasy Wrapped ships (Jan 2027) — first viral opportunity
    - NFL season starts (Sep 2026) — peak engagement window
```
