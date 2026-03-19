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

### PHASE 1: TWITTER LAUNCH (March 16-22)

**Goal:** Announce Razzle on Twitter. Establish "context is the product" narrative. Drive first traffic to razzle.lol.

The site doesn't need to be perfect — it needs to be functional enough that a curious Twitter visitor can open the Screener, be impressed, and follow the account.

| # | Task | Done When |
|---|------|-----------|
| 1-1 | Deploy to production | razzle.lol loads. Health check passes. HTTPS works. Every page renders. |
| 1-2 | Stripe test transaction | Register → trial → upgrade → real charge → webhook fires → Pro unlocks. Money in your Stripe account. |
| 1-3 | Mobile spot check | Open razzle.lol on a real phone. Home → Screener → one panel → Bureau. No broken layouts. |
| 1-4 | Twitter account ready | @razzle_lol (or chosen handle) has bio, profile image (tiger), pinned tweet ready. |
| 1-5 | Launch thread posted | "ChatGPT doesn't know your league. Razzle does." thread with Screener screenshots. Link to razzle.lol. |
| 1-6 | 20 Screener screenshots ready | Pre-made screenshots of the most compelling Lab views — scatter plots, heat maps, dynasty rankings, breakout finder. Ammunition for daily tweets. |

**Exit criterion:** razzle.lol is live, Stripe works, Twitter account is active with launch thread posted.

---

### PHASE 2: BUILD THE BUREAU (March 23 - April 15)

**Goal:** Build the Bureau intelligence features that make the product indispensable. These are the conversion drivers — the features that turn "cool free tool" into "I need to pay for this."

The autonomous loop builds these from TICKETS.md while you focus on Twitter presence.

| # | Feature | What it does |
|---|---------|-------------|
| 2-1 | Self-Scout (default view) | Connected user sees their own team analyzed first — depth, build profile, power rank, "how opponents see you" |
| 2-2 | Roster Depth Analysis | Starter quality vs bench depth by position, vulnerability flags, depth scores (0-100) |
| 2-3 | Build Profiles | Roster construction archetypes — Hero RB, Zero RB, Stars & Scrubs, Youth Movement, Win Now, Balanced |
| 2-4 | League Power Rankings | Composite rankings beyond W-L — roster strength, depth, activity, schedule difficulty |
| 2-5 | Trade Network | Who trades with whom, trade balance, position tendencies, "most likely trade partner" |
| 2-6 | Waiver Tendencies | FAAB burn rate, pickup hit rate, position bias, waiver hawk scores |
| 2-7 | Head-to-Head | Full rivalry comparison — record, roster edges, trade history, simulated matchup |
| 2-8 | Strength of Schedule | Remaining matchup difficulty, easy/hard stretches, playoff path preview |

**Parallel work during this phase:**
- Lab panel-by-panel quality audit (batches A-D, E-P, R-Z)
- Continue Twitter presence — 3-5 posts/week with Screener data
- Fix bugs as users report them
- "Coming soon: ESPN, Yahoo" announcement on Bureau page

**Exit criterion:** All 8 Bureau features are live. Self-scout is the default Bureau view. A connected Sleeper user can answer every question they have about their league and their rivals.

---

### PHASE 3: REDDIT SEEDING (April 16 - May 31)

**Goal:** Build Reddit credibility and seed Razzle screenshots into the fantasy community. By the end of this phase, r/DynastyFF should have seen Razzle screenshots multiple times without knowing it's a coordinated effort.

| # | Task | Done When |
|---|------|-----------|
| 3-1 | Build posting history | 2+ months of genuine participation on r/DynastyFF and r/fantasyfootball. Helpful comments, analysis, trade advice. No product mentions. | Active, credible account |
| 3-2 | Seed analysis posts (4-6) | Use Screener screenshots to post genuine analysis. "2026 rookie big board using combine + college data." "Dynasty buy-lows heading into camp." Watermark does the marketing. | 4-6 posts with visible watermark |
| 3-3 | "I built a thing" post | When posting history is established. "I built a free fantasy football screener." Lab walkthrough with screenshots. Humble builder tone. | Post published with positive engagement |
| 3-4 | Formula Store seeding | Create 5+ high-quality formulas (dynasty value composite, breakout score, buy-low indicator). Publish to store. Share in relevant threads. | Store has real, useful content |
| 3-5 | Friends & family beta | Send razzle.lol to 10+ people who play fantasy. Watch them use it. Fix what they hit. | 10+ real humans have used it and given feedback |
| 3-6 | "Coming soon" hype | Announce ESPN/Yahoo support coming soon. Post Bureau screenshots showing league odds, depth analysis. "Connect your Sleeper league and see this for your team." | Community is aware and interested |

**Exit criterion:** Reddit has seen Razzle. Screenshots are circulating. Multiple organic "what tool is that?" questions in comments. Friends & family feedback incorporated.

---

### PHASE 4: DRAFT SEASON PUSH (June - August)

**Goal:** Convert awareness into registrations. Dynasty startup drafts and rookie drafts are happening. This is peak engagement for the primary audience.

| # | Task | Done When |
|---|------|-----------|
| 4-1 | Draft content blitz | Lab screenshots during rookie drafts and startup drafts — prospect profiles, dynasty values, draft grades. Real-time content. | Razzle is the tool people reference during drafts |
| 4-2 | Situation Room showcase | "ChatGPT vs Razzle with league context" comparison thread on Twitter + Reddit. Side-by-side screenshots. The money content. | Comparison posted with strong engagement |
| 4-3 | Bureau showcase | Post league odds screenshots, self-scout results, depth analysis. "I just connected my league and found out I'm one injury from crisis at RB." | Bureau screenshots shared organically |
| 4-4 | Community formula posts | Highlight community formulas from the store. "This dynasty breakout formula predicted 3 of last year's top 10 risers." | Formula Store has community engagement |
| 4-5 | Email capture | Waitlist or registration flow capturing emails before the NFL season starts. Target: 5,000 registered users by Week 1. | Email list growing |
| 4-6 | Weekly email briefing | For registered users — 3-4 stat insights from the Lab + Situation Room teaser. Drives Pro trial starts. | Automated weekly emails sending |

**Exit criterion:** 500+ registered users. 50+ Sleeper connections. Formula Store has community content. Email list building. First paid conversions happening.

---

### PHASE 5: NFL SEASON — CONVERSION (September 2026 - January 2027)

**Goal:** Convert registered users to paid. This is where the 1,000 paid user target gets hit.

| # | Task | Done When |
|---|------|-----------|
| 5-1 | In-season content machine | Weekly Screener screenshots, Bureau odds updates, Situation Room briefing highlights. The product generates shareable content every week. | Consistent weekly content output |
| 5-2 | Group chat virality | League odds screenshots, self-scout results, and trade analysis designed to be shared in league group chats. One manager using Razzle makes the whole league curious. | Users sharing Razzle in group chats organically |
| 5-3 | Weekly Razzle briefings | Automated weekly intel drops for paid users. The habit loop. Users open Razzle every Tuesday because Razzle has something for them. | Briefings driving retention |
| 5-4 | Trade deadline content | "The managers most likely to panic-sell in your league" — Bureau pressure maps at peak trade season. Highest conversion moment of the year. | Trade deadline content drives upgrade spike |
| 5-5 | Conversion funnel optimization | Track: Screener visit → registration → Sleeper connection → trial start → paid conversion. Optimize the weakest step. | Funnel conversion rates improving weekly |
| 5-6 | Playoff/championship push | "What the Quant agent says about your championship odds." High-stakes moments drive fence-sitters to convert. | Championship content drives final conversion push |

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
