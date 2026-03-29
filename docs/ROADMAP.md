# Razzle — Ship Roadmap

**Goal: 1,000 paid users by end of 2026 NFL season.**
**Today: March 14, 2026 (Saturday)**

---

## Where We Are

The core product is built. 162 build phases + 8 ship phases + autonomous loop fixes. What exists:

**Built and working:**
- The Screener: 100+ stat columns, custom formulas, formula store, visualizations, PNG export with watermark, URL state serialization
- The Lab: 70+ analytical panels behind Pro paywall
- Bureau of Intelligence: Sleeper connection, manager profiling, trade finder, pressure maps, activity feeds, Monte Carlo league odds (summary + deep-dive)
- Situation Room: Pixel canvas with 6 animated agents, LLM integration (BYOK + Elite), cross-agent triggers, format-aware queries
- Auth & Billing: Registration, JWT, Stripe, Free/Pro/Elite tiers, 7-day trial, Sleeper ID lock
- Infrastructure: esbuild minification, security headers, rate limiting, 59+ tests, Render deployment config

**Not yet built:**
- Bureau deep intelligence features (roster depth, build profiles, trade network, waiver tendencies, power rankings, H2H, self-scout)
- Full Lab panel-by-panel quality audit
- Production deployment verified with real traffic
- Stripe verified with real charges
- Twitter/Reddit launch content

**Known issues being fixed by autonomous loop:**
- Various UI inconsistencies across 74 pages
- Dark mode font legibility
- Toolbar still needs work on some pages

---

## The Phases

### PHASE 1: TWITTER LAUNCH (March 16-22, extended — [HUMAN] tasks pending)

**Goal:** Announce Razzle on Twitter. Establish "context is the product" narrative. Drive first traffic to razzle.lol.

The site doesn't need to be perfect — it needs to be functional enough that a curious Twitter visitor can open the Screener, be impressed, and follow the account.

| # | Task | Type | Done When |
|---|------|------|-----------|
| 1-1 | Deploy to production | [AUTO] | razzle.lol loads. Health check passes. HTTPS works. Every page renders. |
| 1-2 | Stripe test transaction | [HYBRID] | Register → trial → upgrade → real charge → webhook fires → Pro unlocks. Auto runs test; human verifies real charge. |
| 1-3 | Mobile spot check | [AUTO] | Open razzle.lol on a real phone. Home → Screener → one panel → Bureau. No broken layouts. |
| 1-4 | Twitter account ready | [HUMAN] | @razzle_lol has bio, profile image (tiger), pinned tweet ready. Account creation requires human. |
| 1-5 | Launch thread posted | [HYBRID] | "The free fantasy football research lab" thread with Screener screenshots. Auto drafts; human reviews and posts. |
| 1-6 | 20 Screener screenshots ready | [HYBRID] | Pre-made screenshots of the most compelling Lab views. Auto generates from Lab; human curates best 20. |

**Exit criterion:** razzle.lol is live, Stripe works, Twitter account is active with launch thread posted.

---

### PHASE 2: BUILD THE BUREAU (March 23 - April 15)

**Goal:** Build the Bureau intelligence features that make the product indispensable. These are the conversion drivers — the features that turn "cool free tool" into "I need to pay for this."

The autonomous loop builds these from TICKETS.md while you focus on Twitter presence.

| # | Feature | Type | What it does |
|---|---------|------|-------------|
| 2-1 | Self-Scout (default view) | [AUTO] | Connected user sees their own team analyzed first — depth, build profile, power rank, "how opponents see you" |
| 2-2 | Roster Depth Analysis | [AUTO] | Starter quality vs bench depth by position, vulnerability flags, depth scores (0-100) |
| 2-3 | Build Profiles | [AUTO] | Roster construction archetypes — Hero RB, Zero RB, Stars & Scrubs, Youth Movement, Win Now, Balanced |
| 2-4 | League Power Rankings | [AUTO] | Composite rankings beyond W-L — roster strength, depth, activity, schedule difficulty |
| 2-5 | Trade Network | [AUTO] | Who trades with whom, trade balance, position tendencies, "most likely trade partner" |
| 2-6 | Waiver Tendencies | [AUTO] | FAAB burn rate, pickup hit rate, position bias, waiver hawk scores |
| 2-7 | Head-to-Head | [AUTO] | Full rivalry comparison — record, roster edges, trade history, simulated matchup |
| 2-8 | Strength of Schedule | [AUTO] | Remaining matchup difficulty, easy/hard stretches, playoff path preview |

**Parallel work during this phase:**
- Lab panel-by-panel quality audit (batches A-D, E-P, R-Z)
- Continue Twitter presence — 3-5 posts/week with Screener data
- Fix bugs as users report them
- "Coming soon: ESPN, Yahoo" announcement on Bureau page

**Exit criterion:** All 8 Bureau features are live. Self-scout is the default Bureau view. A connected Sleeper user can answer every question they have about their league and their rivals.

---

### PHASE 3: REDDIT INTEGRATION (April 16 - May 31)

**Goal:** Don't just post ON Reddit. Become part of Reddit's infrastructure. The !razzle bot makes Razzle the tool that lives inside the community. Reddit account connection makes every user's experience personalized by their own dynasty history.

#### 3A: Reddit Account + Credibility (April 16-30)

| # | Task | Type | Done When |
|---|------|------|-----------|
| 3-1 | Build posting history | [HUMAN] | 2+ months of genuine participation on r/DynastyFF and r/fantasyfootball. Helpful comments, analysis, trade advice. No product mentions. |
| 3-2 | Seed analysis posts (4-6) | [HYBRID] | Use Screener screenshots to post genuine analysis. Auto generates screenshots; human writes posts and engages. |
| 3-3 | Friends & family beta | [HUMAN] | Send razzle.lol to 10+ people who play fantasy. Watch them use it. Fix what they hit. |

#### 3B: !razzle Reddit Bot (May 1-15)

The bot makes Razzle's data available inside Reddit threads. Someone types a command, the bot responds with real data from the Razzle API, every response links back to razzle.lol. The bot IS the distribution channel.

| # | Task | Type | Done When |
|---|------|------|-----------|
| 3-4 | Build Reddit bot (PRAW + Razzle API) | [AUTO] | ~200 lines Python. Bot listens for mentions via PRAW, queries the existing /api/players endpoint, formats response as Reddit markdown table. |
| 3-5 | !razzle [player] command | [AUTO] | `!razzle Bijan Robinson` returns a markdown table: PPR PPG, target share, snap %, age, rush yards, TDs. Footer links to razzle.lol. |
| 3-6 | !razzle compare [A] vs [B] command | [AUTO] | `!razzle compare Breece Hall vs Bijan Robinson` returns side-by-side markdown table. |
| 3-7 | !razzle prospect [name] command | [AUTO] | `!razzle prospect Cam Ward` pulls from college_players and prospects tables. |
| 3-8 | !razzle breakouts command | [AUTO] | `!razzle breakouts` returns top 5 breakout candidates from /api/breakouts endpoint. |
| 3-9 | Deploy bot | [HYBRID] | Run as persistent process on Render. Human messages r/DynastyFF mods for approval. |
| 3-10 | Monitor and iterate | [HYBRID] | Auto tracks usage metrics; human analyzes and decides iterations. |

**Virality math**: If the bot gets summoned 50 times/day and each response is seen by 100 people, that's 5,000 daily impressions with a razzle.lol link. At 1% click-through = 50 site visits/day from a bot that costs nothing to run.

#### 3C: Reddit Account Connection (May 15-31)

This is the second moat. Sleeper gives Razzle your roster. Reddit gives Razzle your INTENT. Together, the agents know what you own AND what you're thinking about.

| # | Task | Type | Done When |
|---|------|------|-----------|
| 3-11 | Reddit OAuth integration | [AUTO] | User connects Reddit account via OAuth on razzle.lol. PRAW handles auth flow. Store Reddit username linked to Razzle account. |
| 3-12 | Multi-account support (burners) | [AUTO] | Users can connect MULTIPLE Reddit accounts. UI copy: "Add as many accounts as you want. We know the burner exists. Your main. Your 'asking for a friend' account. The one you use when you don't want your leaguemate to see you posting about selling his favorite player. All accounts feed your agents. More context = better analysis. We don't judge. We just read the tape." No usernames displayed publicly, just "3 Reddit accounts connected." | User can connect 2+ accounts, all merge into one intent profile |
| 3-13 | Comment history analysis | [AUTO] | Pull public comment history from ALL connected accounts across fantasy subs. Claude (Sonnet) parses for: players discussed, league format, positions of interest, trade questions, tools complained about. Burner posts are often more honest = richer data. |
| 3-14 | Reddit Pulse (Atlas) — Elite feature | [AUTO] | Atlas continuously ingests community Reddit data and builds consensus per player: bullish/bearish trending, discussion volume, sentiment shifts over time. Every agent gets a "Reddit thinks" layer. |
| 3-15 | Full agent Reddit integration | [AUTO] | ALL agents use Reddit data in their domain. Hawkeye: "Reddit is hyping Player X but snap count is flat — narrative, not signal." Bones: "Your leaguemate posted about needing an RB on r/DynastyFF last Tuesday — that's your buyer." Dolphin: "Reddit thinks this injury is minor. Recurrence rate says 40%." Octo: "Reddit values him as WR15. My model says WR8. That's a 7-spot inefficiency." Razzle synthesizes: "Here's what your league thinks, what Reddit thinks, what the data says, and where all three disagree." | All 6 agents reference Reddit data in their responses |
| 3-16 | Bot-to-site bridge | When a user summons !razzle AND has connected accounts, bot gives personalized context: "Based on your league, this player would be your RB2 and you're thin at the position." Friends see personalized responses, ask "how did it know that?", connect their own accounts. | Personalized bot responses for connected users |

**Why this is nuclear**: No other fantasy tool reads your Reddit activity. Nobody else knows you've been agonizing over a trade for two weeks across two accounts. The agents don't just analyze your roster — they analyze your MINDSET. The burner account support says "we're dynasty managers too, we get it." That's the level of trust and personalization that makes someone say "this is worth $100/year."

**The flywheel**:
```
Reddit data flows in (scraper + user comment histories)
    -> Atlas builds community consensus per player
    -> Every agent gets a "Reddit thinks" layer
    -> Elite users get "Reddit was WRONG about X" insights
    -> Users share those insights back ON Reddit
    -> More people discover Razzle from those posts
    -> More accounts connected (mains AND burners)
    -> More Reddit data flows in -> Atlas gets smarter -> flywheel accelerates
```

| # | Task | Done When |
|---|------|-----------|
| 3-16 | "I built a thing" post | [HUMAN] | When posting history is established AND the bot is live. Post published with positive engagement. |
| 3-17 | Formula Store seeding | [HYBRID] | Auto creates formulas; human shares in relevant threads. |

**Exit criterion:** !razzle bot is live and being used in r/DynastyFF. Reddit account connection is functional. Users are getting personalized agent responses. Multiple organic "what bot is that?" questions in threads. The bot IS the growth channel.

---

### PHASE 4: DRAFT SEASON PUSH (June - August)

**Goal:** Convert awareness into registrations. Dynasty startup drafts and rookie drafts are happening. This is peak engagement for the primary audience.

| # | Task | Type | Done When |
|---|------|------|-----------|
| 4-1 | Draft content blitz | [HYBRID] | Auto generates Lab screenshots; human curates and posts during drafts. |
| 4-2 | Situation Room showcase | [HUMAN] | Comparison thread on Twitter + Reddit with side-by-side screenshots. Human writes and posts. |
| 4-3 | Bureau showcase | [HYBRID] | Auto generates Bureau screenshots; human writes posts and engages. |
| 4-4 | Community formula posts | [HYBRID] | Auto creates seed formulas; human shares in relevant threads. |
| 4-5 | Email capture | [AUTO] | Waitlist or registration flow capturing emails before NFL season. |
| 4-6 | Weekly email briefing | [AUTO] | Automated weekly emails with stat insights + Situation Room teaser. |

**Exit criterion:** 500+ registered users. 50+ Sleeper connections. Formula Store has community content. Email list building. First paid conversions happening.

---

### PHASE 5: NFL SEASON — CONVERSION (September 2026 - January 2027)

**Goal:** Convert registered users to paid. This is where the 1,000 paid user target gets hit.

| # | Task | Type | Done When |
|---|------|------|-----------|
| 5-1 | In-season content machine | [HYBRID] | Auto generates weekly screenshots; human curates and posts. |
| 5-2 | Group chat virality | [HUMAN] | Design shareable League odds screenshots. Human drives organic sharing. |
| 5-3 | Weekly Razzle briefings | [AUTO] | Automated weekly intel drops for paid users. |
| 5-4 | Trade deadline content | [HYBRID] | Auto generates Bureau pressure maps; human writes posts and engages. |
| 5-5 | Conversion funnel optimization | [HYBRID] | Auto tracks funnel metrics; human analyzes and optimizes. |
| 5-6 | Playoff/championship push | [HYBRID] | Auto generates championship odds content; human writes and posts. |

**Exit criterion:** 1,000 paid users. The business is profitable at ~$100k/yr.

---

### POST-SEASON (February 2027+)

Build based on what users actually asked for.

| Priority | Initiative | Rationale |
|----------|-----------|-----------|
| P1 | ESPN/Yahoo league imports | 3x the addressable market. Build what was announced as "coming soon." |
| P1 | Agent memory persistence | Multi-season behavioral data. More seasons = richer profiles = higher switching cost. |
| P1 | User feedback loop | In-app feedback mechanism. Systematic input, not just Reddit comments. |
| P2 | Formula Store marketplace | Paid listings with commission. Community content = Reddit discussion = growth. |
| P2 | IDP support | Defensive stats. Opens an underserved market. |
| P2 | Performance optimization | Based on real usage data — optimize what real users actually hit. |
| P3 | DFS support | Ownership projections, correlation stacking. Separate audience, high volume. |
| P3 | PWA / mobile experience | Offline capability for most-used views. |

---

## Conversion Funnel

```
Twitter/Reddit post (screenshot with watermark)
    ↓
razzle.lol landing page ("The Screener is forever free")
    ↓
Open the Screener → explore data → create formulas → share screenshots
    ↓
Connect Sleeper → see league odds summary (free) → "I want the deep-dive"
    ↓
Self-scout shows your team's vulnerabilities → "I need this"
    ↓
Start 7-day Pro trial (no credit card)
    ↓
Bureau deep intelligence + Situation Room agents
    ↓
Trial ends → "Subscribe to keep Pro" → $9.99/mo or $79.99/yr
```

Every step must work flawlessly. If any step is broken, that's priority over everything else.

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Twitter launch gets no traction | Have 20 screenshot posts ready. Engage with fantasy accounts directly. The thread format allows multiple shots. |
| Reddit posts removed by mods | Follow subreddit rules exactly. 2+ months of genuine posting history first. Lead with value, not promotion. |
| Users sign up but don't convert | Bureau self-scout is the conversion driver. If it doesn't create "I need this" moments, the features aren't good enough — improve them. |
| Stripe webhook issues in production | Test with real charges before launch. Log every webhook event. Have manual upgrade capability as backup. |
| Sleeper API rate limits or changes | Cache league data aggressively. Build offline-capable Bureau views. Monitor API status. |
| 80% of users are free forever | Expected. Free users generate screenshots and word of mouth. Even 5% conversion from 20,000 free users = 1,000 paid. |

---

## Execution Rules

1. **1,000 paid users is the only metric.** Every decision filters through: "does this help us get to 1,000?"
2. **The Screener is the growth engine.** Every screenshot is a billboard. Protect its quality obsessively.
3. **The Bureau is the conversion engine.** If a connected user doesn't feel the urge to upgrade, the Bureau isn't good enough.
4. **Ship fast, fix fast.** Deploy fixes within 1 hour during launch windows. Speed of response IS the brand.
5. **Real humans, real data, real money.** No more synthetic testing. Every verification uses real Sleeper accounts, real Stripe charges, real phones.
6. **Twitter first, Reddit second.** Build credibility on Twitter, transfer it to Reddit. Not the other way around.

---

## Timeline Summary

| Dates | Phase | Goal |
|-------|-------|------|
| Mar 16-22 | **Twitter Launch** | Site live, Stripe working, launch thread posted |
| Mar 23 - Apr 15 | **Build the Bureau** | 8 intelligence features, Lab audit, daily Twitter |
| Apr 16 - May 31 | **Reddit Seeding** | Posting history, seed screenshots, "I built a thing" |
| Jun - Aug | **Draft Season Push** | Registrations, draft content, email list, Formula Store |
| Sep 26 - Jan 27 | **NFL Season Conversion** | Hit 1,000 paid users |
| Feb 27+ | **Post-Season Growth** | ESPN/Yahoo, agent memory, community features |
