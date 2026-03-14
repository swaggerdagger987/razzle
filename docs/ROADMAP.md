# Razzle — Updated Ship Roadmap

**Hard Deadline: NFL Draft Week (April 24, 2026)**
**Today: March 14, 2026 — 41 days out**

---

## Where We Are

The product is built and hardened. 162 build phases shipped all three pillars, then 8 ship phases (A through H) plus bug fixes and polish passes brought everything to production quality. Here's the scorecard:

**Done:**
- The Lab: 74 HTML pages, 70+ analytical panels, full screener, formula builder, visualizations, PNG export with watermark, URL state serialization, mobile scroll support
- Bureau of Intelligence: Sleeper connection, manager profiling (multi-season behavioral data), trade finder, pressure maps, activity feeds, free/Pro gating with blurred previews
- Situation Room: Pixel canvas with 6 animated agents, LLM integration via BYOK (OpenRouter), cross-agent triggers, format-aware queries, "What can I ask?" panel, first-run setup guide, Elite server-side AI
- Auth & Billing: Registration, JWT sessions, Stripe integration, Free/Pro/Elite tiers, 7-day trial, early adopter + lifetime pricing, promo codes
- Infrastructure: esbuild minification, security headers, rate limiting, encrypted BYOK backup, 59+ tests, structured logging, season-aware defaults, Render deployment config
- Conversion Funnel: Landing page storytelling, Bureau section, Situation Room demo (55 permutations), pricing page with feature matrix + FAQ, trial onboarding with expiry warnings, Pricing nav on all 74 pages, og:image PNG on all pages
- Design Consistency: Design token audit, typography audit, position colors, component borders (2px+ everywhere), loading state personality, dark mode scoping, mobile overflow scroll on all tables
- Data: Full 2025 NFL season (19,421 rows), 2025 college season (4,148 players), 2026 combine data (319 prospects), half-PPR backfilled across all seasons

**Not Done:**
- Never deployed to production and verified live on razzle.lol with real traffic
- No analytics or tracking for user behavior
- Reddit launch strategy not executed
- Stripe not verified with real test transactions end-to-end
- Domain (razzle.lol) DNS and HTTPS not verified
- No real-user testing beyond automated test suite
- AdSense not configured (empty publisher ID)
- Formula Store exists but hasn't been stress-tested with real formulas

---

## Strategic Framing

The build is done. The hardening is done. What remains is the gap between "works in development" and "survives contact with strangers."

Three things must be true by April 24:

1. **razzle.lol loads in a browser**, fast, on any device, and every page works. Not "the code is written" — actually live on the internet.
2. **The money path works.** A real human can register, start a trial, connect Sleeper, enter a scenario in the Situation Room, and upgrade to Pro — with a real Stripe charge that lands in your bank account.
3. **Reddit knows Razzle exists.** Lab screenshots are circulating. Power users have discovered it. The draft week reveal post has a warm audience.

---

## Now / Next / Later

### NOW — Pre-Launch Verification (Mar 15–28, 2 weeks)

Everything here is about proving the product actually works live. No new features. No new panels. Just verification that what's built survives the real world.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| N-1 | Production deployment | Deploy to Render. Verify terminal.db downloads from GitHub release. Health check passes. Hit every page on razzle.lol — home, Lab, Bureau, Situation Room, pricing, about, 404. Verify HTTPS. Verify custom domain resolves. | razzle.lol loads in a browser with no errors |
| N-2 | Stripe end-to-end | Create Stripe test mode products and price IDs. Run through full flow: register → start trial → enter billing info → upgrade to Pro → verify webhook fires → subscription active → Pro features unlock → cancel → downgrade. Then repeat in live mode with a real $1 test charge. | Money flows from user to your Stripe account |
| N-3 | Auth flow on production | Register with real email. Login. Logout. Password reset (if implemented). JWT persists across refresh. Session expires correctly. Trial badge shows. | Auth works for real humans, not just test scripts |
| N-4 | Sleeper connection on production | Connect 3+ real Sleeper usernames (different league counts, formats). Verify leagues load, rosters render, manager profiles build, trade finder runs, pressure map calculates. Test with an invalid username. Test with a user who has 0 leagues. | Bureau works with real Sleeper data in production |
| N-5 | Situation Room on production | Configure a real OpenRouter API key. Run 5 diverse scenarios (dynasty trade, start/sit, waiver claim, injury impact, keeper decision). Verify all 6 agents respond. Verify cross-agent triggers fire. Verify league context appears in Pro mode but not Free mode. | AI briefings work in production with real LLM calls |
| N-6 | Mobile spot check | Open razzle.lol on a real phone (iPhone Safari + Android Chrome). Navigate home → Lab → screener → panel → Bureau → Situation Room. Verify no horizontal overflow, nav works, tables scroll, text is readable. | Core flow is usable on mobile |
| N-7 | Performance baseline | Measure: landing page load time (target < 3s), Lab screener initial load (target < 2s), screener filter response (target < 500ms), agent LLM round-trip (target < 25s). Document baseline numbers. | Know your actual performance numbers |
| N-8 | Basic analytics | Add simple server-side request logging: page views by path, API calls by endpoint, registration count, trial starts, Sleeper connections. Can be as simple as structured log lines parsed later. No need for a full analytics platform pre-launch. | Can answer "how many people visited today?" |

**Exit criterion:** You can hand someone the URL razzle.lol, they can explore the Lab, connect Sleeper, run an agent query, and upgrade to Pro — all on a real phone or laptop — without hitting a single error. You know how many people are doing each step.

---

### NEXT — Soft Launch + Reddit Seeding (Mar 29–Apr 12, 2 weeks)

Get real humans using the product. Build credibility on Reddit before the reveal.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| X-1 | Friends & family beta | Send razzle.lol to 5-10 people who play fantasy football. Watch them use it (screen share or ask for feedback). Fix whatever they hit. | 5+ real humans have used the product and given feedback |
| X-2 | Hotfix cycle | Based on beta feedback, fix the top 3-5 issues. Prioritize anything that blocks the funnel (can't register, can't connect Sleeper, page crashes). Deploy fixes same day. | Top beta issues resolved |
| X-3 | Seed analysis posts (3-4) | Use Lab screenshots to post genuine analysis on r/DynastyFF and r/fantasyfootball. Pure value, no self-promotion. Watermark does the marketing. Topics: 2026 rookie big board, dynasty buy-lows, offseason trade values using the screener, breakout candidate analysis. | 3-4 posts published with watermark visible |
| X-4 | Community engagement | Be the most helpful person in the comments. When someone asks "where'd you get that data?" or "what tool is that?" — answer naturally with a Lab link. | Active, helpful presence in target subreddits |
| X-5 | AdSense setup | Apply for Google AdSense. Configure publisher ID. Verify ads render on free pages (Lab, Bureau, landing) without breaking layout or UX. | Ad revenue is flowing (even if small) |
| X-6 | Formula Store seeding | Create 3-5 high-quality formulas yourself (dynasty value composite, breakout score, buy-low indicator, best ball ceiling score). Publish to Formula Store. Test the full flow: create → publish → someone else finds it → uses it. | Formula Store has real, useful content |

**Exit criterion:** Real humans are using the product. You've fixed the worst bugs they found. Reddit has seen Razzle screenshots but doesn't know it's yours yet. The Formula Store has seed content. Ads are rendering.

---

### LATER — Draft Week Launch (Apr 13–26)

The reveal. Everything before this was preparation.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| L-1 | Tool reveal post | "I built a free research lab for fantasy football." Post on r/DynastyFF and r/fantasyfootball with Lab screenshots (screener, radar charts, prospect rankings, formula builder). Link to razzle.lol. Tone: humble builder sharing a passion project. | Reveal post published, engagement tracked |
| L-2 | r/SleeperApp post | "Connect your Sleeper leagues to see AI-powered manager profiles and trade intelligence." Highlight Bureau features — manager behavioral profiles, trade finder, pressure maps. | SleeperApp-specific post published |
| L-3 | Launch day monitoring | Watch server logs for errors. Monitor Render health. Be ready to hotfix within 1 hour. Have a "sorry, we're seeing heavy traffic" message ready if load spikes. | No extended downtime on launch day |
| L-4 | Conversion tracking | Track: landing page → Lab click-through, Lab → Sleeper connection, Sleeper → Situation Room trial, trial → paid conversion. Even rough numbers from server logs. | Know your funnel conversion rates |
| L-5 | Response management | Reply to every comment on reveal posts. Answer questions. Be genuinely helpful. Fix reported bugs publicly ("fixed, try again"). This is your brand moment. | Every commenter gets a response |
| L-6 | Draft week content | During the actual NFL Draft (Apr 24-26), post Lab screenshots of rookies as they're picked — instant draft grades, prospect profiles, dynasty impact. Real-time content that showcases the tool. | Razzle is the tool people are looking at during the draft |

**Exit criterion:** Razzle has a visible presence on Reddit. Power users are in the Lab. Some have connected Sleeper. Trial signups are happening. You can measure the funnel.

---

## Post-Draft Growth (May–August)

These ship after launch based on user feedback and conversion data. Ordered by expected impact on retention and revenue.

| Priority | Initiative | Rationale |
|----------|-----------|-----------|
| P1 | Weekly Razzle briefings | Automated weekly intel drops for paid users. The habit loop that drives retention. Users should open Razzle every Tuesday because Razzle has something for them. |
| P1 | Agent memory persistence | Multi-season per-league behavioral data. More seasons = richer profiles = higher switching cost. The moat. |
| P1 | User feedback loop | In-app feedback mechanism. You need to hear from users systematically, not just from Reddit comments. |
| P2 | Formula Store marketplace | Paid listings with 15-20% commission. Community content creates Reddit discussion threads = growth. |
| P2 | IDP support | Defensive stats as filterable Lab columns. Agents evaluate IDP same as offense. Opens a large underserved market. |
| P2 | Performance optimization | Based on real usage data — optimize the queries, pages, and flows that actual users hit most. |
| P3 | DFS support | Ownership projections, correlation stacking, value formulas. Separate audience but high-volume. |
| P3 | Native mobile experience | Not a native app, but a PWA with offline capability for the most-used Lab views. |
| P3 | AdSense optimization | Tune placement on free pages. Target: cover server costs ($50-100/mo). |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Render deployment issues (DB download, env vars) | Medium | High — blocks everything | Test deploy this weekend. Keep a local backup deployment plan. |
| Stripe webhook misconfiguration | Medium | High — no revenue | Test in Stripe test mode first. Verify webhook signatures. Log every webhook event. |
| Reddit posts removed by mods | Medium | Medium — delays distribution | Follow subreddit rules exactly. Lead with value, not promotion. Have backup subreddits. |
| SQLite locking under concurrent load | Low | High — site breaks at worst time | WAL mode already enabled. Monitor during soft launch. Have a "read replica" plan if needed. |
| LLM API costs surprise | Low | Medium — margin squeeze | BYOK model means users bear most cost. Monitor Elite tier usage closely. Set spending alerts on OpenRouter. |
| 2026 NFL offseason trades change data | Low | Low — stale but not wrong | Plan a data refresh script that can run in 10 minutes. Run weekly during offseason. |

---

## Execution Rules

1. **No new features until after Draft Day.** The Lab has 70+ panels. The Bureau has manager profiles, trade finder, and pressure maps. The Situation Room has 6 agents. This is enough. Make what exists work flawlessly.
2. **Live verification over local testing.** Every task in the NOW phase must be verified on razzle.lol, not localhost. The gap between "works on my machine" and "works on the internet" is where launches die.
3. **Fix the funnel, not the edges.** If the landing page → Lab → Bureau → Situation Room → pricing → register → trial path has a single broken step, that's priority over everything else.
4. **Real humans, real data, real money.** Test with real Sleeper usernames. Process a real Stripe charge. Have a real person use the product while you watch. Synthetic testing is over.
5. **Ship fast, fix fast.** During soft launch and reveal, deploy fixes within 1 hour of a report. Speed of response IS the brand during launch week.

---

## Timeline Summary

| Dates | Phase | Focus |
|-------|-------|-------|
| Mar 15–28 | **NOW: Pre-Launch Verification** | Deploy, verify Stripe, verify auth, verify Sleeper, verify agents, mobile check, analytics |
| Mar 29–Apr 12 | **NEXT: Soft Launch + Reddit Seeding** | Beta users, hotfixes, seed posts, community presence, AdSense, Formula Store content |
| Apr 13–26 | **LATER: Draft Week Launch** | Reveal post, SleeperApp post, launch monitoring, conversion tracking, draft content |
| May–Aug | **Post-Draft: Growth** | Weekly briefings, agent memory, Formula Store marketplace, IDP, DFS |

---

## What Changed From the Previous Roadmap

The previous roadmap (Phases A–G) was a hardening plan that assumed the product wasn't production-ready. **That work is done.** Phases A through H, bug fixes, and polish passes are all complete.

This updated roadmap shifts from "make it work" to "prove it works live and get it in front of people." The key changes:

- **Removed**: All QA/hardening phases (A–F) — completed
- **Removed**: Build pipeline phase (G) — completed
- **Removed**: BYOK security cleanup (H) — completed
- **Added**: Production deployment verification (was assumed, never explicitly verified live)
- **Added**: Stripe end-to-end with real money (was tested in code, not with real charges)
- **Added**: Friends & family beta (real humans, not automated tests)
- **Added**: Analytics baseline (can't improve what you can't measure)
- **Restructured**: Now/Next/Later format instead of weekly phases — more honest about what's committed vs. directional
- **Kept**: Reddit launch strategy from original Phase G, expanded with soft launch seeding period
