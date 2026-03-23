# Razzle Go-To-Market Report — Cycle 12

**Generated**: 2026-03-23
**Previous Cycle**: 2026-03-22 (Cycle 11)
**Target**: 1,000 people paying ~$100/year = $100,000/year
**Status**: Pre-launch (Twitter active since 2026-03-20, site live at razzle.lol, 17 tweets posted, 41 approved in queue through April 23, 100+ rejected, zero engagement data yet)

**Cycle 12 thesis**: This cycle was supposed to be impossible — Cycles 8-11 all declared "no more research." But Cycle 12 exists because the ROADMAP added two new distribution pillars that require new research: the **!razzle Reddit bot** and **Reddit account connection**. And the research uncovered a CRITICAL platform change: **Reddit killed self-service API keys in November 2025.** All new OAuth tokens now require pre-approval through Reddit's Developer Support form, with personal bots "rarely approved." This fundamentally changes the bot strategy's timeline and risk profile. The bot is still the highest-ROI channel, but the path to deploying it is no longer "write 200 lines of Python" — it's "apply for API access, wait for review, THEN write 200 lines of Python." This cycle adds material new information for the first time since Cycle 8.

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

### CRITICAL CYCLE 12 UPDATE

**No new fantasy football competitors discovered. Competitive landscape stable for 5th consecutive cycle.**

The only material competitive development is a PLATFORM change (Reddit API access — see Section 7B), not a competitor change.

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
6. **Distribution channels** — Dynasty Daddy has 4 (Discord bot, Fantasy Wrapped, Patreon, Creator Tools). Razzle has Twitter (17 tweets posted, 41 queued).
7. **Reddit bot** — No dynasty bot exists on Reddit, but neither does Razzle's. **And Reddit API access is now gated** (see Section 7B).

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
3. **Zero distribution channels beyond Twitter.**
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
| **Reddit Bot (!razzle)** | 7 | **9** (revised UP) | N/A | 0 | **No dynasty/NFL Reddit bot exists. FPLbot proves model for soccer. FFBot proves WDIS model. Open lane.** |
| **Fantasy Wrapped (proposed)** | 9 | 3 | **10** | 5 | DD proved this. Razzle adds behavioral angle. |
| **Discord Bot (proposed)** | 6 | 3 | N/A | 0 | DD already has one. |

### PMF Changes — Cycle 12

**Reddit Bot uniqueness revised UP from 8 to 9.** Research confirmed:
- FPLbot exists only for Fantasy Premier League (soccer), not NFL/dynasty
- FFBot (r/fantasyfootball) only serves WDIS threads with FantasyPros rankings, not general player data lookup
- **Zero bots exist that let you type `!razzle Bijan Robinson` and get dynasty-relevant stats in a Reddit comment**
- The lane is completely open for NFL/dynasty

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

### Ranked by ROI (updated Cycle 12)

| Rank | Channel | Effort | Expected Return | Timeline | Status |
|------|---------|--------|----------------|----------|--------|
| 1 | **Reddit Bot** | **Medium** (revised UP from Low) | Very High | **2-4 weeks** (revised from 1-2) | **NOT STARTED. API access gated by Reddit pre-approval. CRITICAL BLOCKER DISCOVERED.** |
| 2 | **Twitter** | Low (maintenance) | High | **Active** | **17 posted, 41 queued. WORKING.** |
| 3 | **Reddit (r/DynastyFF)** | High | Very High | 2-3 months | **Account NOT created. Day 3 of Week 1 ending.** |
| 4 | **Discord Bot** | Low (200 lines) | High | 1-2 weeks | Not started. DD proved model. |
| 5 | **League group chats** | Zero effort | High | Viral | Requires Bureau to be impressive. |
| 6 | **Reddit (r/fantasyfootball)** | Medium | High | 2-3 months | Same Reddit account. |
| 7 | **SEO** | Low | Medium | 3-6 months | 70+ pages = natural SEO surface. |
| 8 | **Fantasy Wrapped** | Medium (1 week) | Very High | Jan 2027 | DD proved viral. Plan with behavioral data. |
| 9 | **Content Creator partnerships** | Medium | Medium | 2-3 months | DD Creator Tools shows the model. |
| 10 | **Fantasy podcasts** | Medium | Medium | 1-3 months | Behavioral profiling = unique talking point. |
| 11 | **YouTube** | High | Medium | 3-6 months | After traffic exists. |
| 12 | **Paid ads** | High cost | Unknown | Not recommended | Only after organic working. |

### Section 7B: Reddit Bot Distribution Strategy — MAJOR UPDATE (Cycle 12)

#### THE CRITICAL FINDING: Reddit Killed Self-Service API Keys

**In November 2025, Reddit discontinued self-service API credential creation under their Responsible Builder Policy.** The old workflow — go to reddit.com/prefs/apps, click "create app," get OAuth credentials instantly — is gone. All new applications now require manual review through Reddit's Developer Support form.

**What this means for !razzle:**

| Factor | Before (pre-Nov 2025) | After (current) |
|--------|----------------------|-----------------|
| API credential creation | Instant, self-service | Manual review, 7+ day wait |
| Approval for personal bots | Automatic | **"Rarely approved"** |
| Approval for mod tools | Automatic | Somewhat likely (100K+ subs) |
| Commercial use | Self-service | **$10,000+/month Enterprise** or rejection |
| Existing credentials | N/A | **Still work if created before Nov 2025** |
| Rate limits (free tier) | 100 QPM (OAuth) | 100 QPM (OAuth) — unchanged |
| Non-OAuth (public JSON) | ~10 RPM | ~10 RPM — still available |

**Sources**: [molehill.io analysis](https://molehill.io/blog/reddit_killed_self-service_api_keys_your_options_for_automated_reddit_integration), [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy), [wappkit.com bot guide](https://www.wappkit.com/blog/how-to-build-reddit-bot-python-2025)

#### Additional Reddit Platform Change: Bot Labels Coming

In a **February 7, 2026 shareholder letter**, CEO Steve Huffman announced that Reddit will soon require all automated accounts to carry an explicit, system-level "Verified Bot" label. Details are expected "in the coming weeks." This is actually POSITIVE for !razzle — a verified label adds legitimacy and trust.

**Source**: [CompsMag analysis](https://www.compsmag.com/news/reddits-verified-bot-revolution-a-new-era-for-brand-transparency-and-community-trust/)

#### Risk Assessment Update

| Scenario | Likelihood | Impact | Mitigation |
|----------|-----------|--------|-----------|
| API application approved (non-commercial community tool) | **Medium** (40-60%) | Positive — bot deploys as planned | Frame application as community tool for r/DynastyFF, not commercial product. Emphasize value-add to subreddit. |
| API application rejected | **Medium** (30-40%) | High — bot strategy delayed | **Fallback 1**: Devvit (Reddit's official bot platform for mods). **Fallback 2**: Public JSON endpoints for read + manual posting initially. **Fallback 3**: Partner with r/DynastyFF mods to request API access as a mod tool. |
| API application delayed (>2 weeks) | **High** (50-70%) | Medium — timeline slips past Draft Week | Apply IMMEDIATELY. Build bot code in parallel. Deploy the moment credentials arrive. |

#### Revised Bot Strategy (Cycle 12)

**The bot is STILL the highest-ROI channel.** The API gating adds friction but does not kill the strategy. Here's the revised plan:

**Phase 1: Apply for API Access (Day 1 — TODAY)**
1. Create Reddit account for the bot (u/razzle_bot or similar)
2. Submit Developer Support form with application describing:
   - Purpose: "Community data bot for r/DynastyFF and r/fantasyfootball"
   - Scope: "Read comment streams for summon commands, post formatted player data replies"
   - Non-commercial: "Free, open-source community tool — no monetization of bot itself"
   - Expected volume: "<50 requests/minute" (well within free tier)
3. Wait for approval (target: 7 days, realistic: 7-21 days)

**Phase 2: Build Bot Code in Parallel (Days 1-3)**
Build the bot code regardless of API approval status. Architecture:

```
!razzle bot (~200 lines Python)
├── PRAW listener — monitors comment streams for "!razzle" prefix
├── Command parser — regex matching for player name, "compare", "prospect", "breakouts", "trade"
├── API client — hits existing Razzle API endpoints
├── Formatter — converts JSON → Reddit markdown tables
└── Reply poster — posts formatted response with razzle.lol link footer
```

**Modeled after FPLbot** ([GitHub](https://github.com/amosbastian/FPLbot)):
- FPLbot architecture: Python + PRAW + MongoDB + FPL API + Understat
- Commands: `!fplbot <player> vs. <team>`, `!fplbot <player> vs. <player>`
- Player matching: MongoDB text indexes with fuzzy name mapping
- Razzle equivalent: SQLite (terminal.db) + existing /api/players endpoint + fuzzy match

**Modeled after FFBot** ([GitHub](https://github.com/Surye/FFBot)):
- FFBot runs on r/fantasyfootball for WDIS threads
- Polls threads every 5 minutes via PRAW
- Pulls FantasyPros rankings into local DB
- Razzle equivalent: poll comment streams for !razzle summons

**Phase 3: Deploy (upon API approval)**
- Deploy as Render worker process ($0 additional cost)
- Test on r/test subreddit first
- Contact r/DynastyFF mods for approval
- Launch on r/fantasyfootball first (3.4M members, lower bot restrictions)
- Expand to r/DynastyFF when mod-approved

**Fallback if API Rejected:**
1. **Devvit** — Reddit's official Developer Platform for building apps that run inside Reddit. If the bot is built as a Devvit app, it gets native Reddit hosting and doesn't need external API keys.
2. **Public JSON + Manual Reply** — Read comment streams via public JSON endpoints (~10 RPM, no auth needed). Post replies manually or via approved account. Lower automation but still functional.
3. **Mod Partnership** — Partner with r/DynastyFF moderators to host the bot under a mod-approved integration. Mod tools are "somewhat likely" to be approved.

#### Proposed Commands (unchanged, confirmed viable)

| Command | API Endpoint | Response | Funnel Hook |
|---------|-------------|---------|-------------|
| `!razzle Bijan Robinson` | `/api/players` | PPR PPG, target share, snap %, age | "Full profile at razzle.lol" |
| `!razzle compare A vs B` | 2x `/api/players` | Side-by-side table | "Compare tool at razzle.lol" |
| `!razzle prospect [name]` | `/api/players` (college) | Draft pos, college stats, combine | "Scouting report at razzle.lol" |
| `!razzle breakouts` | `/api/breakout-candidates` | Top 5 breakout candidates | "Full finder at razzle.lol" |
| `!razzle trade A for B` | `/api/trade-value-chart` | Value comparison, verdict | "Trade analyzer at razzle.lol" |

#### Virality Math (revised — conservative due to API risk)

**Optimistic (API approved, bot live by Week 3):**
- 50 summons/day x 100 views = 5,000 daily impressions
- At 1% CTR = 50 site visits/day = 1,500/month
- Cost: $0/mo additional on Render

**Conservative (API delayed, bot live by Week 6):**
- Misses Draft Week peak (April 18-24)
- 20 summons/day x 80 views = 1,600 daily impressions
- At 1% CTR = 16 site visits/day = 480/month
- Still the highest-ROI channel at $0 cost

**Worst case (API rejected, fallback path):**
- Devvit app or manual operation
- 10 responses/day x 100 views = 1,000 daily impressions
- Reduced but still valuable

#### Key Precedent: FPLbot Proves the Pattern

FPLbot (github.com/amosbastian/FPLbot) is the reference implementation for a Reddit data bot:
- **Built for r/FantasyPL** (Fantasy Premier League — soccer, not NFL)
- **Stack**: Python 3.6+, PRAW, MongoDB, fpl library, Understat
- **Commands**: `!fplbot <player> vs. <team|player> <optional: fixtures>`
- **Player matching**: MongoDB text indexes with manual name mapping for fuzzy search
- **Response format**: Reddit markdown tables with stats (xG, xA, goals, assists, minutes, key passes)
- **Cron features**: Daily price change alerts posted automatically
- **No engagement stats published**, but the bot has been active on r/FantasyPL for years and is referenced in multiple community resource lists

**Razzle's advantage over FPLbot**: FPLbot serves a single sport (soccer) with limited FPL API data. Razzle has 100+ stat columns, college data, prospect data, trade values, breakout scores, and 70+ analytical panels to funnel users toward. Each bot response is a door into a much deeper product.

**No NFL/dynasty equivalent exists.** This is the open lane.

---

## Section 7C: Reddit Account Connection Strategy — NEW (Cycle 12)

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

## Section 8: 8-Week Launch Plan (REVISED Cycle 12 — Week 1 DAY 3)

### Week 1 (March 21-27): Apply for Reddit API + Start Reddit Account — DAY 3

- [x] Twitter pipeline functional — 41 approved tweets queued
- [x] 17 tweets posted (7 evidence, 5 community, 3 agent verdicts, 2 mascot)
- [ ] **CREATE REDDIT ACCOUNT** — u/DynastyDataNerd (Sprint Q68-Q69 research). **URGENT: March 23 creation = 30 days old by April 22.** Verify email+phone+2FA for CQS boost. Subscribe to r/DynastyFF, r/fantasyfootball.
- [ ] **CREATE BOT REDDIT ACCOUNT** — separate account for the bot (u/razzle_bot or similar). Bots must disclose they are automated.
- [ ] **APPLY FOR REDDIT API ACCESS** — Submit Developer Support form for bot account. Describe as non-commercial community data tool. Include: purpose, scope, expected volume (<50 QPM), subreddit targets. **This is the critical-path bottleneck — 7-21 day approval wait.**
- [ ] **BUILD BOT CODE** — 200 lines Python. PRAW + Razzle API. FPLbot as reference. Can be built in parallel with API approval.
- [ ] Follow 50-100 fantasy football accounts on Twitter
- [ ] Engage in 5-10 dynasty Twitter threads per day
- **Measure**: Reddit accounts created (personal + bot), API application submitted, bot code complete, Twitter followers
- **URGENCY**: Every day of delay reduces automod safety margin for personal account AND delays API approval for bot. Apply today. Build today.

### Week 2 (March 28 - April 3): Reddit Warm-Up + Bot Code Complete

- [ ] Reddit warm-up begins — 3-5 helpful comments/day on r/fantasyfootball
- [ ] Bot code complete and tested locally against Razzle API
- [ ] Follow up on API application if no response
- [ ] Message r/DynastyFF mods about bot policy (regardless of API status)
- [ ] **Explore Devvit fallback** — if API application seems stuck, investigate Reddit Developer Platform as alternative
- [ ] Twitter: ~2 tweets/day from queue (auto-posting)
- **Measure**: Reddit karma, bot code complete, API application status, mod response

### Week 3 (April 4-10): Draft Season Ramp + API Follow-Up

- [ ] NFL Draft (April 24) content prep — prospect comparison screenshots
- [ ] Reddit: transition to r/DynastyFF comments (60/40 split)
- [ ] "Atlas remembers" historical draft comp tweets
- [ ] **API status check** — if approved, deploy bot immediately. If still pending, escalate via Developer Support. If rejected, activate Devvit fallback.
- [ ] Bot handles prospect queries (tested locally, ready to deploy)
- **Measure**: Twitter engagement, Reddit karma, API application status

### Week 4 (April 11-17): Pre-Draft Push + Bot Deployment Target

- [ ] Daily draft prospect tweets (Hawkeye + Atlas voices)
- [ ] "Who's your 1.01 in SF?" poll with data screenshot
- [ ] Reddit comments on draft threads with Lab data
- [ ] 15+ r/DynastyFF comments visible in history
- [ ] **Deploy bot** if API approved. Launch on r/fantasyfootball first (3.4M members).
- [ ] Refill tweet queue — 41 approved depletes ~April 14 at 2/day
- **Measure**: Twitter followers, Reddit karma, bot deployment status, bot summons

### Week 5 (April 18-24): NFL DRAFT WEEK

- [ ] Live-tweet draft picks with instant Lab data
- [ ] "Hawkeye spotted it: [rookie] lands in [situation]"
- [ ] **Reddit bot peak activity** — every draft thread wants player data
- [ ] Maximum content output — highest-traffic week in dynasty
- **Measure**: Followers, site traffic spike, bot summons spike

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

| # | Risk | Likelihood | Impact | Mitigation | Cycle 12 Update |
|---|------|-----------|--------|-----------|----------------|
| 1 | ~~Twitter pipeline broken~~ | **RESOLVED** | — | — | **RESOLVED since Cycle 9.** |
| 2 | **Distribution gap vs Dynasty Daddy** | **HIGH** | Very High | Build Reddit bot + Discord bot. | **Unchanged. DD has 4 channels, Razzle has 1.** |
| 3 | **AI competitive landscape crowding** | **MEDIUM** | High | Lead with behavioral. | **Stable 5th cycle.** |
| 4 | **Sleeper-only + web-only** | **HIGH** | Very High | Desktop 43% cite analytics. Sleeper 5M MAUs. | **Unchanged.** |
| 5 | **RotoBot price competition** | **LOW-MEDIUM** | Medium | Differentiate on features, not price. | **Unchanged.** |
| 6 | **Zero traction on any channel** | Medium | High | Bot channels = passive distribution. | **Unchanged.** |
| 7 | **Reddit mods remove bot** | Medium | High | Build history first. Bot adds value. | **Unchanged.** |
| 8 | **Behavioral profiling is "nice to have"** | **MEDIUM** | **Critical** | Footballguys validates concept. 12 cycles, zero competitors. | **Unchanged. Existential unknown. Week 7 test.** |
| 9 | **Elite tier API costs** | **LOW** | Low | DeepSeek at $0.005/query. 96% margin. | **Unchanged.** |
| 10 | **Solo founder burnout** | Medium | High | Automate pipeline. Claude Code force multiplier. | **Unchanged.** |
| 11 | **Price sensitivity — DN $49.99 undercuts** | **MEDIUM** | Medium | Must justify premium through behavioral. | **Unchanged.** |
| 12 | **Competitor adds behavioral profiling** | Low-Med | Very High | Move fast. Ship first. Data compounds. | **12th cycle: zero competitors in behavioral space.** |
| 13 | **Reddit bot rate-limited or banned** | Low | Medium | PRAW manages limits. Explicit summons only. | **Unchanged.** |
| 14 | **leaguemate.fyi commoditizes Bureau history** | **MEDIUM-HIGH** | Medium | Bureau must lead on behavioral. | **Unchanged.** |
| 15 | **Dynasty Daddy distribution moat widens** | **MEDIUM-HIGH** | High | Build Reddit + Discord bots. Fantasy Wrapped Jan 2027. | **Unchanged.** |
| 16 | **RotoBot scales to mainstream** | **LOW** | Low | RotoBot 2.0 going multi-sport. Less dynasty focus. | **Unchanged.** |
| 17 | **Enterprise AI enters fantasy** | **LOW** | Low | Sourcetable targets data scientists. | **Unchanged.** |
| 18 | **Market maturation limits ceiling** | **LOW** | Low | Growth from depth, not breadth. Favors tools. | **Unchanged.** |
| 19 | **Reddit API access denied for bot** | **MEDIUM** (NEW) | **High** | **NEW RISK.** Reddit killed self-service API keys Nov 2025. Personal bots "rarely approved." Mitigation: (1) Frame as non-commercial community tool, (2) Devvit fallback, (3) Mod partnership, (4) Public JSON + manual operation. Apply TODAY — even if rejected, fallback paths exist. |
| 20 | **Reddit API approval delayed past Draft Week** | **HIGH** (NEW) | **Medium** | **NEW RISK.** 7-21 day approval timeline means application submitted March 23 may not be approved before April 18 (Draft Week). Mitigation: Build bot code in parallel, deploy instantly upon approval. If delayed, Draft Week content still goes via Twitter + Reddit personal account. |
| 21 | **Reddit bot labeling requirement** | **LOW** (NEW) | **Low-Positive** | **NEW RISK (actually opportunity).** CEO Huffman announced mandatory bot labels Feb 2026. Verified bot label adds legitimacy. Comply proactively. |

---

## Section 10: Cycle Delta

### Key Changes From Cycle 11

1. **CRITICAL: Reddit killed self-service API keys (November 2025).** All new OAuth tokens require pre-approval through Reddit's Developer Support form. Personal bots are "rarely approved." This adds 7-21 days to the bot deployment timeline and introduces a Medium-probability risk of rejection. Two new risks added (#19, #20). Bot effort revised from "Low" to "Medium." Bot timeline revised from "1-2 weeks" to "2-4 weeks." **This is the first genuinely material finding since Cycle 8.**

2. **Reddit requiring verified bot labels (February 2026).** CEO Steve Huffman announced mandatory bot labels. This is net-positive for !razzle — a verified label adds trust and legitimacy vs. anonymous bots. Added as Risk #21 at LOW (actually positive).

3. **FPLbot architecture fully documented.** Python + PRAW + MongoDB + FPL API. ~200 lines. Commands via `!fplbot <player> vs <player|team>`. Fuzzy name matching via text indexes. Cron-scheduled price alerts. Active on r/FantasyPL for years. Reference implementation is solid.

4. **FFBot (r/fantasyfootball) confirmed.** Runs every 5 minutes, polls WDIS threads, provides FantasyPros rankings. Different use case (WDIS vs player lookup) but proves bot viability on r/fantasyfootball specifically.

5. **Zero NFL/dynasty Reddit bots confirmed for 12th cycle.** The lane is completely open. FPLbot = soccer only. FFBot = WDIS threads only. No bot lets users type `!razzle <player>` and get dynasty stats. Reddit Bot PMF uniqueness revised UP from 8 to 9.

6. **Sleeper API confirmed no-auth, 1000 RPM.** Read-only, no OAuth, no API keys. Trivially easy to integrate. Not relevant to bot (bot hits Razzle's own API), but confirms Sleeper connection features are technically simple.

7. **Reddit API free tier confirmed at 100 QPM for non-commercial OAuth use.** Well within bot needs (~50 RPM peak). Cost: $0. Commercial tier is $12K+/year — irrelevant for current scale.

8. **No new competitors discovered.** 5th consecutive cycle with stable landscape.

9. **Three new fallback paths identified for bot.** (1) Devvit (Reddit's official bot platform), (2) Public JSON endpoints for read-only + manual posting, (3) Mod partnership for API access under mod tool category. Bot strategy is more resilient than Cycle 11 assumed, despite API gating.

### Strategic Priorities (Cycle 12 — UPDATED with API risk)

1. **Apply for Reddit API access** — TODAY. The 7-21 day approval timeline is the new critical path. Every day of delay pushes bot deployment further from Draft Week (April 18-24). Submit application for bot account immediately.
2. **Create Reddit accounts** — TODAY. Personal account (u/DynastyDataNerd) AND bot account (u/razzle_bot). Both start aging. Both need to exist for API application.
3. **Build Reddit bot code** — THIS WEEK. In parallel with API approval. Code should be ready to deploy the moment credentials arrive.
4. **Ship Bureau behavioral profiles** — THE MOAT. Must be live before Week 7 reveal (May 2-8). 39 days away.
5. **Explore Devvit fallback** — If API application is not approved within 10 days, begin building the bot as a Devvit app instead.
6. **Monitor Twitter engagement** — 17 tweets posted. Need engagement data to calibrate content strategy.
7. **Refill tweet queue** — 41 approved through April 23. At 2/day cadence, queue depletes by April 14. Need new batch by then.

### The honest assessment (Cycle 12)

**This cycle produced genuinely new, material findings for the first time since Cycle 8.** The Reddit API gating is a real constraint that changes the bot timeline and risk profile. The FPLbot/FFBot architecture research provides concrete implementation guidance. The Devvit fallback is a new path that didn't exist in previous cycles' analysis.

**The competitive landscape remains unchanged for the 5th consecutive cycle.** Behavioral profiling is uncontested for the 12th time. No new dynasty tools discovered.

**The four things that will determine if Razzle reaches 1,000 paid users (updated):**
1. Does behavioral profiling create "I need this" moments? (unchanged — untested)
2. Can distribution channels be built despite Reddit API gating? (UPDATED — new constraint)
3. Does the Screener create viral screenshots during Draft season? (unchanged — untested)
4. Can a solo founder execute fast enough? (unchanged — execution dependent)

**The ONE action that matters more than anything else today (March 23):**

Submit the Reddit API application. Everything else can wait. The application is the critical path. The 7-21 day clock doesn't start until you apply.

---

## CRITIQUE

### Self-Review Flags

**Section 7B (Reddit Bot Strategy — NEW):**
- [REALITY CHECK] Reddit API approval rates are sourced from one article (molehill.io). "Rarely approved" for personal bots may be overstated — the article has a pessimistic tone and sells an alternative product. Actual approval rate is unknown. Risk #19 may be overweighted.
- [NEEDS ACTION] Bot account needs to be created before API application can be submitted. Account creation is a prerequisite.
- [REALITY CHECK] Devvit fallback is mentioned but not researched in depth. Devvit may have limitations that make it unsuitable for a comment-stream-listening bot. Needs investigation if API is rejected.

**Section 7C (Reddit Account Connection — NEW):**
- [DEFERRED] Reddit OAuth for account connection shares the same API gating bottleneck. One application should cover both. No separate research needed until Phase 3C.

**Section 8 (Launch Plan):**
- [REALITY CHECK] Week 1 now includes API application (7-21 day wait), bot code build, AND Reddit account creation. This is achievable but the API wait is outside our control. The plan correctly builds code in parallel but deployment depends on Reddit's approval timeline.

### Flags Summary: 5 total (up from 3 in Cycle 11)
- 1 NEEDS DATA (DD ad revenue — low priority, perpetually unfixable)
- 2 REALITY CHECK (behavioral WTP — existential; API approval rate — sourced from one article)
- 1 NEEDS ACTION (create bot account before API application)
- 1 DEFERRED (Reddit OAuth for account connection — Phase 3C)

---

## FINANCIAL MODEL

```
RAZZLE FINANCIAL MODEL — CYCLE 12 (UPDATED)
============================================

Revenue — unchanged from Cycle 11
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

Bot Channel Economics (REVISED — with API risk scenarios)

  Optimistic (API approved Week 2, bot live Week 3):
    Reddit: 50 summons/day x 100 views = 5,000 impressions/day
    Discord: 30 commands/day x 20 members = 600 impressions/day
    Total: 5,600 daily impressions
    At 1.5% CTR = 84 visits/day = 2,520/month
    At 35% usage, 10% Sleeper: ~88 connections/month
    At 15% trial, 20% conversion: ~2.6 new paid/month from bots

  Conservative (API approved Week 4, bot live Week 5):
    Reddit: 20 summons/day x 80 views = 1,600 impressions/day
    Total: ~2,200 daily impressions (incl Discord)
    At 1.5% CTR = 33 visits/day = 990/month
    Conversion: ~1 new paid/month from bots
    Still net-positive at $0 cost

  Pessimistic (API rejected, Devvit/manual fallback):
    Reddit: 10 manual responses/day x 100 views = 1,000 impressions/day
    At 1% CTR = 10 visits/day = 300/month
    Conversion: ~0.3 new paid/month
    Low but non-zero at $0 cost

Timeline — unchanged from Cycle 11
  Current users: 0
  Month 1 target: 50 site visits/day (bot + Twitter)
  Month 3 target: 100 registered users, 25 Sleeper connections
  Month 6 target: 50-100 paid users
  Month 12 target: 300-500 paid users
  Month 18 target: 1,000 paid users

  Key milestones (UPDATED):
    - Reddit API application submitted (Week 1 — TODAY)
    - Reddit accounts created (Week 1 — TODAY)
    - Bot code complete (Week 1-2)
    - Reddit API approved (Week 2-4 — OUTSIDE OUR CONTROL)
    - Bot deployed (immediately upon API approval)
    - Reddit account warm-up complete (Week 5)
    - Behavioral profiling reveal (Week 7) — PMF validation
    - NFL Draft (April 24) — peak content window
    - Tweet queue refill (by April 14)
    - Fantasy Wrapped ships (Jan 2027) — first viral opportunity
    - NFL season starts (Sep 2026) — peak engagement window
```

---

## RECOMMENDATION

**Cycle 12 produced material new findings (Reddit API gating) that justify its existence. This was NOT a wasted cycle.**

However: **NO CYCLE 13.** The research is now complete. The remaining unknowns are:
1. Will Reddit approve the API application? (Answer: apply and find out)
2. Will behavioral profiling create WTP? (Answer: ship and test)
3. Will the bot get traction? (Answer: deploy and measure)

None of these can be answered by research. All three require execution.

**The three highest-impact actions, in order:**
1. **Submit Reddit API application** (5 minutes — starts the critical-path clock)
2. **Create Reddit accounts** (personal + bot — 10 minutes — starts age clock)
3. **Build bot code in parallel** (1 day — ready to deploy upon approval)

**Every hour spent on Cycle 13 is an hour stolen from the API application. Apply now.**

Sources:
- [FPLbot GitHub](https://github.com/amosbastian/FPLbot)
- [FFBot GitHub](https://github.com/Surye/FFBot)
- [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- [Reddit killed self-service API keys (molehill.io)](https://molehill.io/blog/reddit_killed_self-service_api_keys_your_options_for_automated_reddit_integration)
- [Reddit verified bot labels (CompsMag)](https://www.compsmag.com/news/reddits-verified-bot-revolution-a-new-era-for-brand-transparency-and-community-trust/)
- [Reddit API pricing guide (bbntimes)](https://www.bbntimes.com/technology/complete-guide-to-reddit-api-pricing-and-usage-tiers-in-2026)
- [Sleeper API docs](https://docs.sleeper.com/)
- [Reddit bot building guide 2025 (wappkit)](https://www.wappkit.com/blog/how-to-build-reddit-bot-python-2025)
- [Reddit API credentials guide 2025 (wappkit)](https://www.wappkit.com/blog/reddit-api-credentials-guide-2025)
- [r/DynastyFF stats (subredditstats)](https://subredditstats.com/r/dynastyff)
- [r/fantasyfootball stats (subredditstats)](https://subredditstats.com/r/fantasyfootball)
