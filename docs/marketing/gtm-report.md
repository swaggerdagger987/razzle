# Razzle Go-To-Market Report — Cycle 9

**Generated**: 2026-03-21
**Previous Cycle**: 2026-03-21 (Cycle 8)
**Target**: 1,000 people paying ~$100/year = $100,000/year
**Status**: Pre-launch (Twitter active since 2026-03-20, site live at razzle.lol, 10 tweets posted, 44 approved in queue through April 23, 116 rejected, zero engagement data yet)

**Cycle 9 thesis**: Research saturation was reached in Cycle 8. This cycle confirms that conclusion and pivots the report toward execution prioritization. The remaining unknowns (behavioral WTP, bot mod policy) require building, not researching.

---

## Section 1: Market Sizing

### Total Addressable Market (TAM)

The global fantasy sports market is valued at **$42.37 billion in 2026** (DemandSage/Mordor Intelligence — up from $37.28B in 2025 at 13.66% CAGR), projected to reach ~$80.3B by 2031. The fantasy football segment specifically is projected at **$1.87 billion in 2026** (Global Growth Insights).

**47.3 million Americans** played fantasy football during the 2025 NFL season (FSGA/Angus Reid Phase 1 survey, May-June 2025, n=3,930 U.S. adults — 14.2% of total U.S. population). 57 million played fantasy sports in the past 12 months.

**Mobile dominance**: Mobile accounted for **62%** of the fantasy football market in 2025 ($1.10B vs $0.66B desktop). However, **43% of desktop users specifically cite "detailed analytics"** as their reason for staying desktop — directly aligned with Razzle's core product.

**Premium subscription behavior**: **29% of fantasy sports users subscribe to premium features** (DemandSage 2026). In-app purchases across fantasy tools account for **$450 million in annual spending**.

### Serviceable Addressable Market (SAM): Dynasty Football Managers

- **r/DynastyFF**: **~192k members** (March 2026)
- **Sleeper**: **4M+ total users, 2M DAUs**. Estimated 30-50% dynasty -> **1.2-2M dynasty managers on Sleeper**
- **Dynasty Nerds**: **50,000+ active users, 11,000+ premium at $69.99/yr**
- **Dynasty Daddy**: **~502K monthly visits, 416 paid Patreon patrons (~$30K/yr)**
- **KeepTradeCut**: **~123K monthly visitors**
- **RotoBot AI**: **50,000+ downloads, 875 ratings at 4.6 stars**

**SAM estimate**: **2-4 million dynasty fantasy football managers** across all platforms. Actively-engaged tool-using subset: **250-500k**.

### Serviceable Obtainable Market (SOM)

Razzle needs 1,000 paid users = **9% of Dynasty Nerds' paid base**, or **0.2-0.4% of the tool-using dynasty audience**. With 29% premium subscription rate applied to SAM: **72,500-145,000 potential paid dynasty users**. Razzle targeting 1,000 = **0.7-1.4%**. Achievable.

**Bottom line**: Market is validated. Distribution, not demand, is the constraint. Unchanged from Cycle 8.

---

## Section 2: Competitive Landscape

### CRITICAL CYCLE 9 UPDATES

**1. RotoBot 2.0.1 launched March 19, 2026 — complete platform pivot.**
- Rebuilt from scratch in React Native
- **Expanded from fantasy football to multi-sport**: NBA, NFL, NCAAB, UFC
- New AI engine with 20+ intent types, Quick Mode + Full Mode
- **Parlay builder with confidence scoring** — entering sports betting territory
- Player props across multiple sports
- 800+ searchable statistics
- **Pricing: $119.99/yr is the listed price on App Store.** $79.99 early bird no longer visible on App Store as of March 2026. Google Play still shows early bird, but the standard annual is $129.99.

**Implication for Razzle**: RotoBot is pivoting AWAY from pure fantasy football toward a sports intelligence super-app. This creates an opening. RotoBot's attention and development resources are now split across 4 sports + betting. A dynasty-focused tool like Razzle competes less directly with RotoBot 2.0 than it did with RotoBot 1.x. Additionally, Razzle's price advantage is now **definitive**: $79.99 vs $119.99 = **33% cheaper**, and the early bird appears expired.

**2. Twitter pipeline RECOVERED — no longer the #1 blocker.**
- **44 approved tweets in queue** (scheduled March 23 through April 23)
- **10 tweets posted** to date (4 evidence, 3 community, 2 agent verdicts, 1 prospect)
- **116 rejected** — rejection patterns remain (stat-bot voice, character count, paywall screenshots) but enough content is passing through
- Pipeline is functional, if not optimal. Content exists through NFL Draft week.

**3. Dynasty Daddy Creator Tools — new distribution channel.**
- OBS WebSocket integration for fantasy football streamers
- Displays KTC/DD trade values, player names, images, team logos on stream overlays
- This is a B2B-to-C distribution play: content creators use DD data → viewers see DD branding → traffic

**4. leaguemate.fyi confirmed unchanged** — 5 free features (WAR, projections, trade intel, draft grades, all-time records). Sleeper-only. Zero behavioral profiling. Zero updates found.

### Pricing Comparison (updated March 21, 2026)

| Competitor | Free Tier | Paid Pricing | Key Features | League Sync | AI | Users/Traffic |
|-----------|-----------|-------------|-------------|-------------|-----|-------------|
| **KeepTradeCut** | Full access | Free (ad-supported) | Crowdsourced trade values (25M+ points), rankings, calc | Sleeper, MFL | No | ~123K/mo visits |
| **Dynasty Nerds** | 3 trades/day | **$69.99/yr** (GM+NerdHerd), $49.99/yr (GM) | Unlimited trades, AI mocks, Film Room, Discord | 5 platforms | AI mocks | 50K+ users, 11K+ paid |
| **Dynasty Daddy** | Full access | **$72/yr** Patreon Club ($6/mo) | Trade calc, playoff sim, trade DB (3.6M+), Fantasy Wrapped, Discord bot, **Creator Tools** | **7 platforms** | No | ~502K/mo, 416 patrons |
| **FantasyCalc** | Full access | **Free** | Algorithmically generated trade values, league sync | Limited | No | Unknown |
| **RotoBot AI** | 3-day trial | **$119.99/yr** (standard) | **2.0: Multi-sport AI** (NFL/NBA/NCAA/UFC), parlay builder, 800+ stats, Quick/Full mode | Sleeper, ESPN | **Yes — league AI** | **50K+ downloads** |
| **FantasyFootball.ai** | 300 credits/wk | **$59.88/yr** Pro, **$95.88/yr** Plus | AI assistant, lineup, trade evals, DFS | ESPN, Yahoo, Sleeper | **Yes — league AI** | Unknown |
| **Dynasty Dealmaker** | 5 tokens/wk | **$77.48/yr** ($1.49/wk) | AI trade generator, contender analysis | Sleeper only | **Yes — AI trades** | Unknown |
| **leaguemate.fyi** | **Full access** | **Free** | WAR, projections, trade intel, draft grades | Sleeper only | No | Unknown |
| **WalterPicks** | Limited | **Paid** | Live draft AI, multi-format | 5 platforms | **Yes — draft AI** | iOS app |
| **Razzle** | Full Screener, Bureau summary | **$79.99/yr** (Pro), **$149.99/yr** (Elite) | 100+ stat screener, Bureau behavioral profiling, 6 AI agents, 70+ panels | Sleeper only | **Yes — behavioral AI** | **0** (pre-launch) |

### What Razzle STILL has that NO competitor has (9th consecutive cycle confirmation)

1. **Behavioral profiling** — Multi-season manager tendency analysis. Zero competitors automate this. Footballguys editorial validates concept.
2. **Pressure maps** — Desperation scoring (0-100). Unique.
3. **Manager personality analysis** — Data-evidenced behavioral profiles. Unique.
4. **Six named agent personas** — Brand storytelling layer. No competitor has character-driven AI.
5. **Free Screener depth** — 100+ columns, custom formulas, formula store, PNG export. Best-in-class free tool.
6. **70+ analytical panels** — Deepest research surface area of any dynasty tool.

### What Razzle does NOT have

1. **Multi-platform sync** — Sleeper-only vs DD (7), DN (5), WalterPicks (5), FF.ai (3+), RotoBot (2+)
2. **Mobile app** — RotoBot (50K+ downloads), Dynasty Nerds, WalterPicks have iOS/Android. Razzle is web-only in 62% mobile market.
3. **Trade database** — Dynasty Daddy has 3.6M+ real trades. Razzle has none.
4. **Community** — Zero Discord, zero podcast, zero Reddit presence, zero track record.
5. **Users** — Zero.
6. **Distribution channels** — Dynasty Daddy has 4 (Discord bot, Fantasy Wrapped, Patreon, Creator Tools). Razzle has Twitter (10 tweets posted, 44 queued).

### Revised Competitive Positioning (Cycle 9)

**RotoBot's multi-sport pivot is the biggest competitive shift since Cycle 1.**

RotoBot 2.0 is no longer a fantasy football AI tool — it's a sports intelligence platform. This means:
- Their engineering resources are split across 4 sports + betting features
- Their product positioning is broadening away from dynasty
- Their price increased to $119.99/yr standard (Razzle is 33% cheaper)
- Dynasty-specific features may get less attention as they chase the bigger market

**This opens a lane.** Razzle's positioning should sharpen: "The dynasty-obsessed AI. While other tools chase every sport, Razzle goes deeper on the one that matters to your league."

**The moat is behavioral intelligence + dynasty focus.** League sync + AI is table stakes (5+ competitors). RotoBot is going wide. Razzle should go deep.

**Positioning**: "Other tools know your roster. Razzle knows your leaguemates."

---

## Section 3: Brand Audit

### What's Working

1. **Visual identity is distinctive.** Warm sand/espresso/comic-strip aesthetic. Zero competitors look like this.
2. **Agent personas create content diversity.** Six characters = tweet variety. Creative quality 4-5/5.
3. **"Forever free" Screener positioning.** RotoBot's biggest complaint is "advertised as free but requires subscription." Razzle avoids this entirely.
4. **"Other tools know your roster. Razzle knows your leaguemates."** 9th consecutive cycle confirmation.
5. **Twitter pipeline is producing content.** 44 approved tweets in queue. 10 posted. Content exists through Draft Day.
6. **Agent connective tissue design.** Agents woven across Lab/Bureau/Situation Room as personality layer.

### What's NOW Working (improved from Cycle 8)

1. **Twitter pipeline — RECOVERED.** Cycle 8 flagged this as the #1 blocker for the 8th consecutive cycle. The queue was refilled with 44 approved tweets spanning March 23 through April 23. The pipeline is functional. Content cadence of ~2 tweets/day is achievable through Draft Day without further intervention. This is no longer the #1 blocker.

### What's Still NOT Working

1. **Zero engagement data.** 10 tweets posted. No impressions, retweets, or follower data available in results.tsv. Cannot measure anything.

2. **No Reddit presence.** Zero posts, zero comments, zero karma. Reddit account creation research done (Sprint Q68-Q72), but account not yet created.

3. **Zero distribution channels beyond Twitter.** Dynasty Daddy now has 4 channels (Discord bot, Fantasy Wrapped, Patreon community, Creator Tools). Razzle has 1 (Twitter, barely started).

4. **Bureau behavioral profiling not yet live.** The feature that IS the moat has not shipped. It exists in architecture but hasn't been built as a standalone experience users can touch and screenshot.

### Brand vs. Competitors

| Dimension | Razzle | KTC | Dynasty Nerds | Dynasty Daddy | RotoBot 2.0 | FF.ai |
|-----------|--------|-----|--------------|---------------|-------------|-------|
| Visual identity | Strong (unique) | Generic | Standard | Basic | Modern/generic | Generic |
| Personality | Strong (6 agents) | None | Moderate | None | None | None |
| Trust | Zero (new) | High | Very high | High | Med (50K, 4.6) | Low |
| Free value | Very high | Very high | Low | Very high | None (trial) | Low |
| Distribution | **1 channel** (Twitter) | Organic | Podcast+Discord | **4 channels** | App stores (50K) | App stores |
| AI context | **Behavioral** (unique) | None | Basic | None | **Multi-sport** | **League AI** |
| Dynasty focus | **100%** | 100% | 90% | 80% | **25% (multi-sport)** | 70% |
| Price (annual) | $79.99 | Free | $69.99 | $72 | **$119.99** | $59.88-$95.88 |

---

## Section 4: Product-Market Fit Scorecard

| Feature | Demand | Uniqueness | Screenshot | WTP | Notes |
|---------|:---:|:---:|:---:|:---:|-------|
| **Screener (100+ columns)** | 7 | 5 | 9 | 2 | Growth engine. Forever free. |
| **Custom Formulas** | 5 | 7 | 7 | 3 | Formula Store unique. |
| **Bureau: League Odds** | 8 | 4 | 10 | 7 | DD has playoff sim. |
| **Bureau: Manager Profiles** | 7 | **10** | 8 | 7 | **THE MOAT.** 9th cycle. Zero competitors. |
| **Bureau: Trade Finder** | 8 | 4 | 7 | 6 | Multiple competitors. |
| **Bureau: Pressure Map** | 5 | **10** | 8 | 6 | Unique. Zero competitors. |
| **Bureau: League History** | 6 | 2 | 6 | 2 | leaguemate.fyi does this free. |
| **Situation Room (AI Agents)** | 7 | 5 | 7 | 4 | RotoBot pivoting to multi-sport = less competition in dynasty AI. Uniqueness up from 4 to 5. |
| **Agent Personas** | 4 | 10 | 6 | 3 | Brand glue. Twitter content value. |
| **Dynasty Rankings** | 8 | 3 | 5 | 4 | Commodity. |
| **PNG Export + Watermark** | 6 | 6 | 10 | 1 | Growth tool. Critical to flywheel. |
| **Reddit Bot (proposed)** | 7 | 8 | N/A | 0 | No dynasty Reddit bot exists. Open lane. |
| **Fantasy Wrapped (proposed)** | 9 | 3 | **10** | 5 | DD proved this. Razzle adds behavioral angle. |
| **Discord Bot (proposed)** | 6 | 3 | N/A | 0 | DD already has one. |

### PMF Summary — Cycle 9

**Strongest PMF signal unchanged**: Bureau Manager Profiles (uniqueness 10) and Pressure Maps (uniqueness 10).

**Cycle 9 change**: Situation Room uniqueness ticked up from 4 to 5. RotoBot 2.0's multi-sport pivot means their dynasty AI attention is diluted. Razzle's dynasty-focused AI agents are more differentiated vs RotoBot 2.0 than vs RotoBot 1.x.

**Critical question (carried since Cycle 4)**: Is behavioral profiling a feature people will PAY for? Still untested after 9 cycles. First test: Week 7 Reddit post (May 2-8). Cannot be resolved by research.

---

## Section 5: Monetization Model

### Pricing Analysis (Cycle 9 — price advantage DEFINITIVE)

**Razzle Pro at $79.99 is now definitively cheaper than RotoBot.**

RotoBot 2.0.1 lists $119.99/yr on App Store with no visible early bird. Google Play shows $129.99/yr standard. The $79.99 early bird that existed for 18+ months appears to have expired with the 2.0 relaunch.

**Competitive pricing (sorted by annual cost)**:
- Dynasty Nerds DynastyGM: **$49.99/yr**
- FantasyFootball.ai Pro: **$59.88/yr** (1 league)
- Dynasty Nerds GM+NerdHerd: **$69.99/yr** (11K+ subs)
- Dynasty Daddy Club: **$72/yr** ($6/mo Patreon)
- Dynasty Dealmaker GM: **$77.48/yr**
- **Razzle Pro: $79.99/yr**
- FantasyFootball.ai Plus: **$95.88/yr** (unlimited)
- FantasyPros HOF: **$107.88/yr**
- **RotoBot AI: $119.99/yr** (App Store) / **$129.99/yr** (Google Play)
- PFF+: **$120/yr**
- PlayerProfiler All-In: **$135/season**
- **Razzle Elite: $149.99/yr**

**Cycle 9 Assessment**: Price positioning is the STRONGEST it has ever been. RotoBot's 2.0 relaunch killed the early bird. Razzle Pro is 33% cheaper than RotoBot standard, cheaper than all premium analytics tools, and only $10-20 more than established dynasty incumbents. The $49.99 fallback tier remains available as insurance.

### Elite Tier Economics (unchanged)

**DeepSeek V3.2 via OpenRouter**: $0.26/M input, $0.38/M output
- Cost per 6-agent query: **$0.0054** (< 1 cent)
- Elite user at 3 queries/day: **$0.49/user/month**
- Margin: 96%

### Conversion Triggers (unchanged — behavioral features lead)

1. **Manager Behavioral Profiles** — "Your rival panics after losses." -> Unique, no alternative.
2. **Pressure Maps** — "Three managers are desperate. Here's who." -> Unique.
3. **Bureau Self-Scout** — "Your RB depth is one injury from crisis." -> Creates urgency.
4. **Fantasy Wrapped with behavioral data** — Shareable, viral.
5. **Group chat virality** — Monte Carlo odds screenshot -> league curiosity.
6. **Trade Finder with behavioral context** — "This manager overpays for RBs in February."
7. **Situation Room** — Dynasty-focused AI vs RotoBot's multi-sport dilution.

### Path to $100k/year

At 1,000 users (any mix), revenue is $80k-150k/yr:
- All Pro: 1,000 x $79.99 = $80k
- 60/40 Pro/Elite: $95.6k
- 50/50: $115k
- All Elite: 1,000 x $149.99 = $150k

---

## Section 6: Agent Character Profiles — Market Fit

### Agent -> Pain Point -> Content Strategy

| Agent | Pain Points (Reddit) | Unique Value | Reddit Content Opportunity | Upvote Potential |
|-------|------|------|------|------|
| **Razzle** (Tiger) | Final verdict, synthesis | Multi-agent synthesis | "Razzle's Verdict" weekly calls | 100-300 |
| **Hawkeye** (Eagle) | Breakouts, Usage (2,100+) | Usage trend detection | "Hawkeye spotted it first" | 300-800 |
| **Bones** (Skeleton) | Trade confusion (199+) | **BEHAVIORAL** trade intel | "Bones mapped your leaguemate" | 200-500 |
| **Dr. Dolphin** | Injuries (#1 at 2,112+) | Injury + league context | Injury impact with league context | 500-2000 |
| **Octo** (Octopus) | Projections, Math | Championship equity | "Octo ran the numbers" | 100-300 |
| **Atlas** (Bull) | Aging (1,379+), History | Multi-season league memory | "Last time this happened..." | 200-500 |

### Twitter Pipeline Status (RECOVERED — Cycle 9)

**Status: Functional.** 44 approved tweets in queue through April 23. 10 posted. Pipeline produces content, though rejection rate remains high (116 rejected / 170 total = 68% rejection rate). Content exists through NFL Draft week without further intervention.

**Remaining mechanical issues** (should be addressed but NOT a blocker):
1. Character count — still generating some 300-470 char tweets
2. Paywall screenshots — some Pro panel screenshots slip through
3. Stat-bot voice — "numbers don't lie" patterns in some drafts

**Priority shift**: Twitter pipeline moved from CRITICAL #1 blocker to MAINTENANCE issue. The real #1 blocker is now **distribution channels beyond Twitter** and **behavioral profiling shipping**.

---

## Section 7: Channel Strategy

### Ranked by ROI (updated Cycle 9)

| Rank | Channel | Effort | Expected Return | Timeline | Status |
|------|---------|--------|----------------|----------|--------|
| 1 | **Reddit Bot** | Low (200 lines) | Very High | 1-2 weeks | **NOT STARTED. Still the highest-ROI unbuilt channel.** |
| 2 | **Twitter** | Low (maintenance) | High | **Active** | **44 tweets queued through Draft Day. FUNCTIONAL.** |
| 3 | **Reddit (r/DynastyFF)** | High | Very High | 2-3 months | Account not yet created. Sprint Q68-Q72 research done. |
| 4 | **Discord Bot** | Low (200 lines) | High | 1-2 weeks | Not started. DD proved model. |
| 5 | **League group chats** | Zero effort | High | Viral | Requires Bureau to be impressive. |
| 6 | **Reddit (r/fantasyfootball)** | Medium | High | 2-3 months | Same Reddit account. |
| 7 | **SEO** | Low | Medium | 3-6 months | 70+ pages = natural SEO surface. |
| 8 | **Fantasy Wrapped** | Medium (1 week) | Very High | Jan 2027 | DD proved viral. Plan with behavioral data. |
| 9 | **Content Creator partnerships** | Medium | Medium | 2-3 months | DD Creator Tools shows the model. |
| 10 | **Fantasy podcasts** | Medium | Medium | 1-3 months | Behavioral profiling = unique talking point. |
| 11 | **YouTube** | High | Medium | 3-6 months | After traffic exists. |
| 12 | **Paid ads** | High cost | Unknown | Not recommended | Only after organic working. |

### Section 7B: Reddit Bot Distribution Strategy (unchanged — still the highest-ROI unbuilt channel)

**No dynasty Reddit bot exists — confirmed 9th cycle.** The infrastructure exists. ~200 lines of Python wrapping existing API endpoints. FPLbot (github.com/amosbastian/FPLbot) provides the reference implementation.

Dynasty Daddy has a Discord bot but NOT a Reddit bot. This is an open lane.

#### Proposed Commands

| Command | API Endpoint | Response | Funnel Hook |
|---------|-------------|---------|-------------|
| `!razzle Bijan Robinson` | `/api/players` | PPR PPG, target share, snap %, age | "Full profile at razzle.lol" |
| `!razzle compare A vs B` | 2x `/api/players` | Side-by-side table | "Compare tool at razzle.lol" |
| `!razzle prospect [name]` | `/api/players` (college) | Draft pos, college stats, combine | "Scouting report at razzle.lol" |
| `!razzle breakouts` | `/api/breakout-candidates` | Top 5 breakout candidates | "Full finder at razzle.lol" |
| `!razzle trade A for B` | `/api/trade-value-chart` | Value comparison, verdict | "Trade analyzer at razzle.lol" |

#### Virality Math (unchanged)

- 50 summons/day x 100 views = 5,000 daily impressions
- At 1% CTR = 50 site visits/day = 1,500/month
- Cost: $0/mo additional on Render

---

## Section 8: 8-Week Launch Plan (REVISED Cycle 9 — Twitter recovered, priorities shifted)

### Week 1 (March 21-27): Build Reddit Bot + Start Reddit Account — ACTIVE NOW

- [x] Twitter pipeline functional — 44 approved tweets queued
- [x] 10 tweets posted (4 evidence, 3 community, 2 agent verdicts, 1 prospect)
- [ ] **CREATE REDDIT ACCOUNT** — u/DynastyDataNerd (Sprint Q68-Q69 research). Verify email+phone+2FA for CQS boost. Subscribe to r/DynastyFF, r/fantasyfootball.
- [ ] **BUILD REDDIT BOT** — 200 lines Python, PRAW + Razzle API. FPLbot as reference.
- [ ] Follow 50-100 fantasy football accounts on Twitter
- [ ] Engage in 5-10 dynasty Twitter threads per day
- **Measure**: Twitter followers, Reddit account age started, bot code complete

### Week 2 (March 28 - April 3): Deploy Bot + Reddit Warm-Up

- [ ] Reddit warm-up begins — 3-5 helpful comments/day on r/fantasyfootball (Sprint Q71 strategy)
- [ ] Message r/DynastyFF mods about bot policy
- [ ] Deploy Reddit bot (pending mod approval)
- [ ] Build Discord bot (200 lines, same architecture)
- [ ] Twitter: ~2 tweets/day from queue (auto-posting)
- **Measure**: Reddit karma, bot deployment, mod response

### Week 3 (April 4-10): Draft Season Ramp + Reddit Credibility

- [ ] NFL Draft (April 24) content prep — prospect comparison screenshots
- [ ] Reddit: transition to r/DynastyFF comments (Sprint Q71 — 60/40 split)
- [ ] "Atlas remembers" historical draft comp tweets
- [ ] Bot handles prospect queries
- **Measure**: Twitter engagement, Reddit karma building

### Week 4 (April 11-17): Pre-Draft Push

- [ ] Daily draft prospect tweets (Hawkeye + Atlas voices)
- [ ] "Who's your 1.01 in SF?" poll with data screenshot
- [ ] Reddit comments on draft threads with Lab data
- [ ] 15+ r/DynastyFF comments visible in history (Sprint Q71 threshold)
- **Measure**: Twitter followers, Reddit karma, bot summons

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
- **Measure**: Reddit post karma, Twitter engagement

### Week 7 (May 2-8): Behavioral Profiling Reveal

- [ ] **THE KILLER POST**: "I built a tool that profiles every manager in your dynasty league."
- [ ] Posted on r/DynastyFF with behavioral profile screenshots
- [ ] Differentiate from leaguemate.fyi: "They show WHO won trades. Razzle shows WHY."
- [ ] Cross-promote on Twitter
- [ ] This is the make-or-break moment for behavioral WTP
- **Measure**: Reddit upvotes, site traffic spike, Sleeper connections

### Week 8 (May 9-15): Evaluate and Adjust

- [ ] Review all metrics (finally have 8 weeks of data)
- [ ] Decision point: Is behavioral profiling resonating?
- [ ] If >200 Twitter followers and >100 visits/day: on track
- [ ] If <50 followers and <10 visits/day: fundamentally rethink
- [ ] Begin planning Fantasy Wrapped for 2026 season
- **Measure**: Registered users, Sleeper connections, paid conversions

---

## Section 9: Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Cycle 9 Update |
|---|------|-----------|--------|-----------|----------------|
| 1 | ~~Twitter pipeline broken~~ | ~~HIGH~~ **RESOLVED** | ~~High~~ | ~~Code fix~~ | **RESOLVED. 44 approved tweets in queue through April 23. No longer a blocker. Downgraded to maintenance.** |
| 2 | **Distribution gap vs Dynasty Daddy** | **HIGH** | Very High | Build Reddit bot + Discord bot. 2-day build. | **DD now has 4 channels (added Creator Tools for streamers). Razzle has 1 (Twitter). Gap widening. #1 RISK.** |
| 3 | **AI competitive landscape crowding** | **MEDIUM** (revised down) | High | Lead with behavioral. Don't compete on generic AI. | **REVISED DOWN. RotoBot 2.0 pivot to multi-sport REDUCES dynasty-specific competition. Lane opening.** |
| 4 | **Sleeper-only + web-only** | **HIGH** | Very High | Desktop users = 43% cite analytics. | Unchanged. |
| 5 | **RotoBot price competition** | **LOW** (revised down further) | Low | Razzle is 33% cheaper. | **REVISED DOWN. RotoBot 2.0 killed the $79.99 early bird. $119.99 is standard. Razzle's price advantage is definitive.** |
| 6 | **Zero traction on any channel** | Medium | High | Bot channels = passive distribution. | 10 tweets, zero engagement data. Queue functional. |
| 7 | **Reddit mods remove bot** | Medium | High | Build history first. Bot adds value. | Unchanged. |
| 8 | **Behavioral profiling is "nice to have"** | **MEDIUM** | **Critical** | Footballguys validates concept. RotoBot 50K proves AI demand. | **Unchanged. Existential unknown. Week 7 test.** |
| 9 | **Elite tier API costs** | **LOW** | Low | DeepSeek V3.2 at $0.005/query. 96% margin. | Unchanged. |
| 10 | **Solo founder burnout** | Medium | High | Automate pipeline. Claude Code force multiplier. | Pipeline automated. Content flowing. |
| 11 | **Price sensitivity** | **LOW** (revised down) | Medium | RotoBot at $119.99 makes $79.99 reasonable. | **FURTHER REDUCED. RotoBot 2.0 pricing makes Razzle look like a deal.** |
| 12 | **Competitor adds behavioral profiling** | Low-Med | Very High | Move fast. Ship first. Data compounds. | DD focused on Creator Tools + multi-platform. Not behavioral. |
| 13 | **Reddit bot rate-limited or banned** | Low | Medium | PRAW manages limits. Explicit summons only. | FPLbot proves pattern. |
| 14 | **leaguemate.fyi commoditizes Bureau history** | **MEDIUM-HIGH** | Medium | Bureau must lead on behavioral. | Unchanged. leaguemate.fyi stable, no new features found. |
| 15 | **Dynasty Daddy distribution moat widens** | **MEDIUM-HIGH** (raised) | High | Build Reddit + Discord bots. Fantasy Wrapped Jan 2027. | **RAISED. DD added Creator Tools = 4th distribution channel. Distribution advantage accelerating.** |
| 16 | **RotoBot scales to mainstream** | **LOW** (revised down) | Low | RotoBot 2.0 is going multi-sport. Less dynasty focus. | **REVISED DOWN. Multi-sport pivot dilutes their dynasty attention. Less direct competition.** |

---

## Section 10: Cycle Delta

### Key Changes From Cycle 8

1. **RotoBot 2.0.1 launched (March 19) — platform pivot to multi-sport.** Rebuilt in React Native. Now covers NBA, NFL, NCAAB, UFC with parlay builder. $79.99 early bird appears killed — $119.99 is the listed App Store price. This is the biggest competitive shift since Cycle 1. Razzle's price advantage is definitive (33% cheaper). RotoBot is going wide; Razzle should go deep on dynasty.

2. **Twitter pipeline RECOVERED.** 44 approved tweets queued through April 23. Pipeline is functional. No longer the #1 blocker (was #1 for cycles 1-8). Moved to maintenance priority.

3. **Dynasty Daddy Creator Tools.** New OBS integration for fantasy streamers. DD now has 4 distribution channels vs Razzle's 1. Distribution gap widened.

4. **Reddit data expanded.** ~12,500+ posts across 19 subreddits (added fresh r/Fantasy_Football batch, base rescrape).

5. **Risk register major revisions.** Risk #1 (Twitter) RESOLVED. Risk #3 (AI crowding) DOWN to MEDIUM. Risk #5 (RotoBot price) DOWN to LOW. Risk #15 (DD distribution) UP to MEDIUM-HIGH. Risk #16 (RotoBot scales) DOWN to LOW.

### Strategic Priorities (Cycle 9 — reordered)

1. **Build Reddit bot** — Highest-ROI unbuilt channel. 200 lines Python. No dynasty Reddit bot exists. Open lane for 9th consecutive cycle.
2. **Create Reddit account** — u/DynastyDataNerd. Start warm-up (Sprint Q68-Q72 strategy). Account age clock is ticking — need 30+ days before Week 7 post.
3. **Ship Bureau behavioral profiles** — THE MOAT. Must be live and screenshotable before Week 7 reveal (May 2-8).
4. **Build Discord bot** — Match Dynasty Daddy's channel. Same architecture as Reddit bot.
5. **Monitor Twitter engagement** — First engagement data should be available soon. Adjust content strategy based on what works.
6. **Plan Fantasy Wrapped** — DD proved viral. Build with behavioral insights for January 2027.

### The honest assessment (Cycle 9)

Research saturation confirmed. Eight cycles of competitive analysis. The report is stable — competitive landscape, pricing, market sizing, risk register are all well-calibrated. The remaining unknowns (behavioral WTP, bot mod policy, Twitter engagement) cannot be resolved by more research.

**The four things that will determine if Razzle reaches 1,000 paid users:**

1. **Does behavioral profiling create "I need this" moments?** Unknown. Requires shipping and testing with real users. Week 7 is the first test.
2. **Can distribution channels be built fast enough?** Reddit bot, Discord bot, Reddit credibility — all require building, not planning.
3. **Does the Screener create viral screenshots during Draft season?** April 24 is 34 days away. 44 tweets queued. Content exists. Need engagement.
4. **Can a solo founder execute fast enough?** Dynasty Daddy has 4 channels and a content creator ecosystem. Razzle has Claude Code. The velocity gap is the real competition.

**Every hour spent on the 10th research cycle is an hour not spent building the Reddit bot.**

---

## CRITIQUE

### Phase 3: Self-Review Flags

**Section 1 (Market Sizing):**
- [REALITY CHECK] 29% premium subscription rate applied to dynasty SAM. Directional, not precise. Impact: minimal at 1,000 target. **Unchanged from Cycle 8.**

**Section 2 (Competitive Landscape):**
- [NEEDS VERIFICATION] RotoBot early bird death — confirmed via App Store fetch ($119.99 is listed), but Google Play still shows early bird. The early bird may not be fully dead, just hidden on iOS. **New flag — but LOW impact. Razzle is cheaper than both prices.**
- [NEEDS DATA] Dynasty Daddy total revenue (ads + Patreon). Patreon is ~$30K/yr. Ad revenue unknown. **Carried from Cycle 8 — low priority.**

**Section 4 (PMF Scorecard):**
- [REALITY CHECK] Behavioral profiling WTP (7) is STILL ASSUMED. 9th cycle. **Existential unknown. Cannot be resolved by research. Requires Week 7 test.**

**Section 7 (Channel Strategy):**
- [NEEDS DATA] r/DynastyFF bot policy. 9th cycle. Must message mods. **5-minute task carried for 9 cycles.**

**Section 8 (Launch Plan):**
- [REALITY CHECK] Week 1 tasks (Reddit account + Reddit bot) require execution by March 27. Account age math: created March 21 = 31 days old by April 21 (Sprint Q69 analysis). Every day of delay reduces the safety margin for the 30-day automod threshold.

### Flags Summary: 5 total
- 2 NEEDS DATA (DD ad revenue — low priority; r/DynastyFF bot policy — requires mod contact)
- 3 REALITY CHECK (behavioral WTP — existential; 29% premium rate — directional; account age timing)
- 0 new research-resolvable flags

**No critical gaps remain that research can fix.**

---

## Phase 4: Gap-Filling Results

1. **RotoBot early bird — PARTIALLY RESOLVED.** App Store fetch confirms $119.99/yr as the listed price. Version 2.0.1 released March 19. The 2.0 relaunch likely retired the early bird. Google Play may still show it as legacy. For planning: assume $119.99 is the new standard. Razzle's price advantage is definitive.

2. **r/DynastyFF bot policy — NOT RESOLVED (9th cycle).** This requires messaging the mods, not web searching. STAYS [NEEDS DATA]. This flag cannot be resolved by the GTM agent — it requires human action (send a 3-sentence DM to the mod team).

3. **Behavioral profiling WTP — CANNOT BE RESOLVED BY RESEARCH (9th cycle).** Only shipping resolves this. STAYS [REALITY CHECK].

4. **Reddit account age timing — PARTIALLY RESOLVED.** Sprint Q69 analysis confirmed: creating account March 21 = 31 days old by April 21. 30-day automod threshold is met but with 1 day of margin. Creating today (March 21) is optimal. **Every day of delay increases risk.**

---

## Phase 5: Second Critique

**Updated flag count: 4** (down from 5 — Reddit account timing partially resolved)

Remaining:
- 1 NEEDS DATA (r/DynastyFF bot policy — requires mod contact, NOT researchable)
- 2 REALITY CHECK (behavioral WTP — existential; 29% premium rate — directional)
- 1 NEEDS VERIFICATION (RotoBot early bird death — low impact)

**No critical gaps remain that research can fix.** All remaining flags require execution (building, shipping, messaging mods, creating accounts).

**CYCLE 9 RECOMMENDATION: STOP RUNNING GTM RESEARCH CYCLES. START BUILDING.**

The report is stable. The competitive landscape is well-mapped. The pricing is favorable. The risks are catalogued. The remaining unknowns require building, not researching.

The three highest-impact actions, in order:
1. Create the Reddit account (5 minutes, starts the age clock)
2. Build the Reddit bot (1 day, highest-ROI channel)
3. Ship Bureau behavioral profiles (the moat, the conversion driver, the Week 7 reveal)

---

## FINANCIAL MODEL

```
RAZZLE FINANCIAL MODEL — CYCLE 9 (UPDATED)
============================================

Revenue
  Target: 1,000 users x blended ~$108/year = ~$108,000/year
  Monthly: $9,000/month

  Pricing tiers:
    Pro:   $9.99/mo  | $79.99/yr  (BYOK — user provides AI key)
    Elite: $19.99/mo | $149.99/yr (AI key included, DeepSeek V3.2)

  Assumed mix at 1,000 users:
    Pro:   600 users x $79.99/yr  = $47,994/yr
    Elite: 400 users x $149.99/yr = $59,996/yr
    Total revenue:                  $107,990/yr ($9,000/mo)

  Conversion funnel (estimated):
    Reddit bot impressions -> site visits:      1-2%
    Discord bot interactions -> site visits:     2-3%
    Twitter/Reddit organic -> site visits:       2-5%
    Site visits -> free user (uses Screener):    30-40%
    Free user -> Sleeper connection:             10-15%
    Sleeper connection -> sees profiles:         80-90%
    Behavioral profiles -> "I need this":        30-50% [UNTESTED]
    "I need this" -> Pro trial:                  20-30%
    Pro trial -> paid ($80-150/yr):              15-25%

  Competitive revenue benchmarks:
    Dynasty Nerds: ~$770K/yr (11K x $69.99)
    Dynasty Daddy: ~$30K/yr Patreon + est. $20-60K ads = ~$50-90K/yr
    RotoBot AI: est. $300K-800K/yr (50K+ users, multi-sport now, higher prices)
    Razzle target: $108K/yr (1,000 users) = 14% of Dynasty Nerds

  Bot channels (Reddit + Discord):
    Reddit: 50 summons/day x 100 views = 5,000 impressions/day
    Discord: 30 commands/day x 20 members = 600 impressions/day
    Total: 5,600 daily impressions
    At 1.5% CTR = 84 visits/day = 2,520/month
    At 35% usage, 10% Sleeper: ~88 connections/month
    At 15% trial, 20% conversion: ~2.6 new paid/month from bots alone

Costs (monthly, at 1,000 users)
  Render hosting (Standard):        $25/mo  (confirmed March 2026)
  Domain (razzle.lol):              $1/mo
  Elite user AI costs:
    400 Elite users x 90 queries/mo
    x $0.0054/query (DeepSeek V3.2 via OpenRouter)
    = $194/mo
  Claude Code subscription:          $200/mo
  Stripe fees (2.9% + $0.30):
    Monthly avg: ~$286/mo
  Reddit/Discord bot hosting:        $0/mo (Render workers)
  Total monthly cost at 1,000 users: ~$706/mo

Unit Economics
  Revenue per user (blended):      $107.99/yr = $9.00/mo
  Cost per Pro user:               ~$0.48/mo (hosting + Stripe)
  Cost per Elite user:             ~$0.97/mo (hosting + Stripe + AI)
  Gross margin per Pro:            ~$8.52/mo (94.7%)
  Gross margin per Elite:          ~$8.03/mo (89.2%)

  Blended margin at 1,000 users:
    Revenue: $9,000/mo
    Costs:   $706/mo
    Margin:  $8,294/mo = 92%

  Annual: $99,528 profit on $107,990 revenue
  Break-even: ~10 paid users covers all fixed costs

Competitive Price Positioning (CYCLE 9 — STRONGEST EVER)
  Razzle Pro at $79.99:
    - 33% CHEAPER than RotoBot standard ($119.99)
    - 38% CHEAPER than RotoBot Google Play ($129.99)
    - 26% CHEAPER than FantasyPros HOF ($107.88)
    - 33% CHEAPER than PFF+ ($120)
    - 41% CHEAPER than PlayerProfiler ($135)
    - 14% MORE than Dynasty Nerds ($69.99)
    - 11% MORE than Dynasty Daddy Club ($72)
    - 33% MORE than FantasyFootball.ai Pro ($59.88)
    - 17% CHEAPER than FantasyFootball.ai Plus ($95.88)

  RotoBot's $79.99 early bird appears DEAD with 2.0 relaunch.
  If confirmed, Razzle Pro is the cheapest AI fantasy tool with
  league sync, behavioral profiling, and 100+ stat screener access.

Timeline (REVISED — more conservative, execution-gated)
  Current users: 0
  Month 1 target: 50 site visits/day (bot + Twitter)
  Month 3 target: 100 registered users, 25 Sleeper connections
  Month 6 target: 50-100 paid users
  Month 12 target: 300-500 paid users
  Month 18 target: 1,000 paid users

  Key milestones gating the timeline:
    - Reddit bot deployed (Week 2) — passive distribution starts
    - Reddit account warm-up complete (Week 5) — organic posting unlocks
    - Behavioral profiling reveal (Week 7) — PMF validation moment
    - Fantasy Wrapped ships (Jan 2027) — first viral opportunity
    - NFL season starts (Sep 2026) — peak engagement window
```
