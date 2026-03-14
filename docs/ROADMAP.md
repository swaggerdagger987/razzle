# Razzle Development Roadmap

**Hard Deadline: NFL Draft Week (April 24, 2026)**
**Today: March 12, 2026 — 6 weeks out**

---

## Where We Are

162 development phases completed. All three pillars from the North Star are built: The Lab (74 HTML pages, 70+ analytical panels, full screener with formulas/visualizations/export), the Bureau of Intelligence (Sleeper connection, manager profiling, trade finder, pressure maps, activity feeds), and the Situation Room (pixel canvas, 6 agent personas, LLM integration, cross-agent triggers, BYOK cloud sync, format-aware queries). Auth, Stripe billing, tiered gating (Free/Pro/Elite), 7-day trial, early adopter pricing, and production infrastructure (security headers, rate limiting, encrypted key storage, 59+ tests) are all in place.

**The features exist. What remains is making them production-quality, visually cohesive, and ready for real users to hit on Draft Day.**

---

## Strategic Framing (Updated)

The original roadmap was a build plan. This roadmap is a ship plan.

The Lab, the Bureau, and the Situation Room all function — but they were built across 162 incremental phases by an autonomous agent. That means inconsistencies have accumulated: design drift across 74 pages, UX flows that were never tested as a cohesive journey, performance under real concurrent load, and edge cases that only surface when strangers use the product for the first time.

**The goal for the next 6 weeks is not new features. It is production confidence.**

Three things must be true by April 24:

1. A Reddit power user lands on razzle.lol, explores The Lab, screenshots something, and shares it — and the link back works flawlessly.
2. A curious user connects Sleeper, sees their leagues in the Bureau, and the upgrade path to the Situation Room is obvious and compelling.
3. A paying user runs a scenario in the Situation Room, gets a league-contextualized briefing, and it feels like magic — not a prototype.

---

## What Ships By Draft Week (April 24)

### Must Have (Launch Blockers)
- All three rooms production-quality: no dead links, no broken JS, no layout bugs
- The Lab → Bureau → Situation Room conversion funnel tested end-to-end with real Sleeper data
- Landing page tells the story in under 10 seconds
- Every shareable URL resolves correctly with og:image preview cards
- Image export with watermark works on the top 10 most-used Lab views
- Render deployment stable under load (health checks, error recovery, DB connection pooling)

### Should Have (Launch Day Polish)
- Mobile-responsive Lab (table is usable on phone — even if not ideal)
- Situation Room first-run experience guides new users to a successful first query
- Pricing page clearly communicates Free vs Pro vs Elite value
- Data freshness: 2025 NFL season stats current through end of regular season + playoffs

### Won't Ship By Draft
- DFS or IDP support
- Formula Store paid listings (marketplace commission)
- Agent memory persistence across seasons
- Weekly automated briefings
- Native mobile app

---

## Phase A: Visual & Design Audit (Mar 12–18, 1 week)

Systematic pass across all three rooms to enforce the design guide. 162 phases of incremental work means design drift is guaranteed.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Design token audit | Verify every page uses correct CSS variables: `--bg` (#ede0cf), `--ink` (#2d1f14), `--orange` (#d97757). Hunt for hardcoded hex values, gray tones, or thin 1px borders that violate the guide. | Zero hardcoded colors outside CSS variables in styles.css |
| 2 | Typography audit | Confirm three-font rule: Garfield/Luckiest Guy for display, Space Mono for data, Caveat only for annotations. Check font loading (preconnect, display:swap). | Every page uses correct fonts for correct purposes |
| 3 | Component consistency | Cards, buttons, chips, badges — verify 3px borders, 4px 4px 0 shadows, hover-lift behavior across all 74 pages. Spot-check 10 representative panels. | Consistent chunky aesthetic across Lab panels, Bureau, Situation Room |
| 4 | Situation Room dark mode | Verify agents.html uses `--bg-ink` (#1a110a) always-dark regardless of theme toggle. Canvas, briefing cards, config panel all dark. | Situation Room is always dark, rest of site respects theme toggle |
| 5 | Position color consistency | QB=blue, RB=teal, WR=terracotta, TE=purple — audit Lab table, panel charts, Bureau roster views, agent briefing cards. | Position colors consistent across all three rooms |
| 6 | Loading state audit | Every async flow shows personality loading text ("pulling film...", "checking the tape..."), not generic spinners or blank states. | Zero generic "Loading..." strings remain |

**Exit criterion:** Open each of the three rooms plus the landing page. The visual language is unmistakably Razzle — warm sand, chunky borders, espresso ink, comic-strip energy. No page looks like it was built by a different team.

---

## Phase B: The Lab — Production Hardening (Mar 19–25, 1 week)

The Lab is the growth engine. It must be bulletproof for strangers.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Core screener stress test | Load Lab with 600+ players. Sort every column. Apply 3+ filters simultaneously. Verify no JS errors, no layout breaks, pagination works. | Screener handles full dataset without errors |
| 2 | Formula builder QA | Create formula → save → refresh → loads. Share formula URL → opens in new browser → exact same formula + sort. Delete formula → gone. | Full formula CRUD lifecycle works across sessions and URLs |
| 3 | Visualization QA | Radar chart with 2-player overlay renders correctly. Scatter plot dots are clickable. Trend chart shows weekly data. No canvas rendering bugs. | All chart types render correctly with real data |
| 4 | Panel audit (top 20) | Test the 20 highest-value Lab panels (dynasty rankings, trade values, breakout finder, aging curves, rookie big board, matchup heatmap, etc). Each must: load data, render correctly, handle empty states, export cleanly. | Top 20 panels verified working |
| 5 | Export & sharing | PNG export on screener view, radar chart, scatter plot. Watermark ("razzle.lol") baked in. Clean aspect ratio. Shareable URLs resolve with og:image. | Exported PNGs look screenshot-worthy with watermark |
| 6 | URL state integrity | Serialize screener state (filters, sort, columns, formula) → copy URL → paste in incognito → exact same view loads. Test 5 complex screener configs. | URL state round-trips perfectly |
| 7 | Performance | Lab initial load < 2 seconds. Screener filter response < 500ms. No jank on sort/filter. Pagination smooth. | Lab feels fast and responsive |

**Exit criterion:** Hand the Lab URL to a fantasy football stranger. They can explore, filter, create a formula, export an image, and share a link — all without hitting a single bug. The exported image makes them want to post it on Reddit.

---

## Phase C: Bureau of Intelligence — Production Hardening (Mar 26–Apr 1, 1 week)

The Bureau is the conversion bridge. Connecting Sleeper must feel seamless, and the league data must make users want more.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Sleeper connection flow | Enter username → fetch leagues → display roster for each league. Test with 5+ real Sleeper usernames (different league counts, different formats). Handle: invalid username, API timeout, user with 0 leagues. | Sleeper flow works for real users with proper error handling |
| 2 | League data rendering | Rosters, standings, transactions render correctly. Bye weeks display. Position depth visible. No stale or missing data. | League data is accurate and complete |
| 3 | Manager profiling | Behavioral profiles (panic history, FAAB patterns, trade tendencies) generate correctly for multi-season leagues. Profiles render in comic-strip card style. | Manager profiles render with real behavioral data |
| 4 | Trade finder QA | League-specific trade finder: value matching works, position need/surplus detection accurate, trade partner cards render with correct data. | Trade suggestions are reasonable and well-presented |
| 5 | Pressure map QA | Desperation scores calculate correctly. Color coding (red=desperate, green=comfortable) renders. Pro gating works (top 3 free, rest blurred). | Pressure map provides useful signal |
| 6 | Bureau → Situation Room bridge | "Ask the Diplomat" CTAs from trade finder and pressure map pre-populate scenario input in Situation Room. Cross-page handoff works via localStorage. | Clicking CTA in Bureau lands in Situation Room with pre-filled scenario |
| 7 | Free vs Pro gating | Free users see: leagues, rosters, basic standings, top 3 pressure entries. Pro features (full profiles, trade finder, full pressure map) show blurred preview + upgrade CTA. | Gating is clear, upgrade path is obvious, no content leaks |

**Exit criterion:** Connect a real Sleeper account. Browse leagues, see manager profiles, find trade partners, and click through to the Situation Room — all without friction. The free tier shows enough value to hook; the gated content makes Pro feel worth it.

---

## Phase D: Situation Room — Production Hardening (Apr 2–8, 1 week)

The Situation Room is the revenue product. It must feel like premium intelligence, not a tech demo.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | First-run experience | New user with no API key: sees demo briefing cards, understands what the product does, knows how to configure. BYOK setup flow is clear. | First-time user can go from zero to first real query in under 2 minutes |
| 2 | Agent execution QA | Run 10 diverse scenarios across formats (redraft start/sit, dynasty trade, keeper decision, injury impact, waiver claim). All 5 specialists + Razzle synthesis must return structured responses. | 10/10 scenarios produce useful, well-structured briefings |
| 3 | Cross-agent triggers | Verify trigger patterns fire correctly: Medical injury → Scout handcuff check, Quant low odds → Diplomat rebuild trade, etc. Follow-up cards render with cross-reference badges. | Cross-agent intelligence visibly adds value |
| 4 | Context bridge verification | Free mode: generic player data in agent context. Pro mode: league roster, scoring settings, rival rosters visible in agent responses. The difference is obvious. | Pro responses clearly reference user's specific league context |
| 5 | Pixel canvas performance | Canvas renders at 60fps. 6 agents walk, work, visit stations. Activity bubbles appear. No memory leaks on long sessions. Agent selection + camera follow works. | Canvas feels alive and performant |
| 6 | "What can I ask?" panel | Format-organized question reference renders. Clicking a question populates textarea. Questions cover redraft, dynasty, keeper, best ball, universal. | Panel helps users understand capabilities |
| 7 | Error handling | LLM timeout (>20s) shows graceful message. Invalid API key shows clear error. Rate limit hit shows retry guidance. Network failure recovers cleanly. | Every error state has a clear, helpful message |
| 8 | BYOK cloud sync | Save key to cloud (encrypted) → load on different browser → key decrypts and works. Auth + Pro tier check works. | Cloud sync is reliable for paying users |

**Exit criterion:** A paying user enters a real fantasy scenario ("Should I trade Ja'Marr Chase for 2 first-round picks in my 12-team SF dynasty league?") and gets a briefing that feels like it was written by a team of analysts who know their league. The pixel agents feel alive. The experience justifies $240/year.

---

## Phase E: Landing Page + Conversion Funnel (Apr 9–12, 4 days)

The landing page is the 10-second pitch. The funnel is the path from curiosity to payment.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Landing page story | Hero → "The Lab" section (screener preview + CTA) → "Bureau" section (Sleeper connection pitch) → "Situation Room" section (demo + agent bios) → Pricing → Footer. 10-second scan tells the whole story. | Landing page communicates value proposition clearly |
| 2 | Situation Room demo | Mini pixel canvas + 55 pre-built briefing permutations rotate on visit. Agents working, content redacted (???, !!!, ...). CTA: "This is a real manager's Situation Room." | Demo creates curiosity and demonstrates product |
| 3 | Full funnel walkthrough | Land on home → click to Lab → explore → connect Sleeper → see Bureau → click Situation Room CTA → see pricing → start trial → run first query. Every step works. | Zero dead ends in the conversion funnel |
| 4 | Pricing page clarity | Free / Pro / Elite tiers clearly differentiated. Feature matrix accurate. FAQ answers common objections. Trial CTA prominent. | A visitor knows exactly what they get at each tier |
| 5 | Trial onboarding | Register → 7-day Pro trial auto-starts → Sleeper prompt → welcome state with CTAs → trial badge in nav → expiry warning at 2 days. | Trial experience is smooth and drives conversion |
| 6 | og:image + social previews | Share razzle.lol, any Lab URL, any panel URL on Reddit/Discord/Twitter. Preview card renders with branded image + description. | Every shareable link looks good in social previews |

**Exit criterion:** Send the razzle.lol URL to 5 friends who play fantasy football. Within 60 seconds, each one understands what Razzle is, finds something interesting in the Lab, and knows how to connect their league.

---

## Phase F: Data Refresh + Backend Hardening (Apr 13–16, 4 days)

Stale data kills credibility instantly.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | 2025 season data | nflverse adapter pulls complete 2025 regular season + playoff data. All stats current through Super Bowl. | terminal.db has full 2025 season |
| 2 | College data refresh | cfbfastR adapter pulls 2025 college season. Draft class prospects have current combine/pro day data if available. | College stats current for 2026 draft class |
| 3 | Render deployment QA | Deploy to Render. Health check passes. DB downloads from GitHub release. All 63+ API endpoints return 200. Auth flow works. Billing webhooks fire. | razzle.lol is fully functional in production |
| 4 | Load testing | Simulate 50 concurrent users hitting Lab endpoints. API response times < 1s under load. No SQLite locking issues. | Backend handles launch-day traffic |
| 5 | Test suite green | All 59+ tests pass. Run full suite against production-like config. No regressions from QA fixes. | CI is green, zero test failures |
| 6 | Error monitoring | Structured logging captures all 4xx/5xx errors with context. Server startup validates all env vars. Unhandled exceptions don't crash the process. | Errors are visible and diagnosable in production |

**Exit criterion:** razzle.lol is deployed with fresh 2025 data, handles concurrent load, and has monitoring in place to catch issues on launch day.

---

## Phase G: Reddit Launch Prep + Content (Apr 17–23, 1 week)

Everything before this phase was building. This phase is distribution.

| # | Task | Detail | Done When |
|---|------|--------|-----------|
| 1 | Seed analysis posts (3-4) | Use Lab screenshots to post genuine analysis on r/DynastyFF and r/fantasyfootball. Pure value — watermark does the marketing. Topics: rookie rankings, dynasty buy-lows, offseason trade values, breakout candidates. | 3-4 posts published, watermark visible, engagement monitored |
| 2 | Community engagement | Respond to comments helpfully. Be the most useful person in the thread. Drop Lab links organically when relevant. | Active presence in target subreddits |
| 3 | Tool reveal post | "I built a free research lab for fantasy football." Screenshots of screener, formulas, charts, agent briefings. Link to razzle.lol. | Reveal post drafted and ready |
| 4 | r/SleeperApp post | "Connect your Sleeper leagues to see AI-powered manager profiles." Highlight Bureau features. | SleeperApp-specific post drafted |
| 5 | Bug triage process | Monitor for user-reported issues. Have a fast fix → deploy cycle ready. Prioritize anything that blocks the funnel. | Can ship a hotfix within 1 hour of report |
| 6 | Analytics baseline | Track: landing page views, Lab usage, Sleeper connections, trial starts, paid conversions. Even simple server logs count. | Know if launch is working |

**Exit criterion:** Razzle has a visible presence on Reddit before Draft Day. Power users are using The Lab. Some have connected Sleeper. The conversion funnel is live and measurable.

---

## Draft Week (April 24–26)

**Brand presence established.** Razzle is live on Reddit. The Lab is the most powerful free fantasy tool these subreddits have seen. The Bureau shows league intelligence. The Situation Room is converting trial users to paid. Every screenshot is a billboard.

---

## Post-Draft (May–June): Growth + Depth

These are not launch blockers. They ship after Draft Week based on user feedback and conversion data.

| Priority | Initiative | Detail |
|----------|-----------|--------|
| P1 | Agent memory persistence | Multi-season per-league memory. More seasons = richer profiles = higher switching cost. |
| P1 | Weekly Razzle briefings | Automated weekly intel drops for paid users. Habit-forming retention mechanism. |
| P2 | Formula Store marketplace | Paid listings with 15-20% Razzle commission. Community content + Reddit growth channel. |
| P2 | IDP support | Defensive stats as filterable columns. Agents evaluate IDP same as offensive. |
| P3 | DFS support | Ownership projections, correlation stacking, value formulas. |
| P3 | AdSense optimization | Tune ad placement on free pages. Revenue target: cover server costs. |

---

## Execution Rules

1. **No new features until Draft Day.** Every hour spent on a new panel is an hour not spent making the existing product bulletproof. The Lab has 70+ panels — make 20 of them excellent rather than adding panel 71.
2. **Fix the funnel, not the edges.** If the landing page → Lab → Bureau → Situation Room path has a single broken step, that's priority over any polish work.
3. **Every deploy gets a smoke test.** Hit the funnel: home → Lab → Bureau → Situation Room → pricing. If any page errors, fix before moving on.
4. **Screenshot test.** After every phase, export a Lab screenshot. Would you post it on Reddit? If not, that's the priority.
5. **Real Sleeper data.** Test the Bureau with real usernames, not mocks. Real data surfaces real bugs.
6. **The Situation Room must justify $240/year.** Every QA pass of the Situation Room should be evaluated through the lens of: would I pay for this?

---

## Timeline Summary

| Dates | Phase | Focus | Duration |
|-------|-------|-------|----------|
| Mar 12–18 | Phase A: Design Audit | Visual consistency across all rooms | 1 week |
| Mar 19–25 | Phase B: Lab Hardening | Screener, formulas, viz, export bulletproof | 1 week |
| Mar 26–Apr 1 | Phase C: Bureau Hardening | Sleeper flow, profiles, trade finder, gating | 1 week |
| Apr 2–8 | Phase D: Situation Room Hardening | Agent execution, canvas, BYOK, error handling | 1 week |
| Apr 9–12 | Phase E: Landing + Funnel | Story, demo, conversion path, trial flow | 4 days |
| Apr 13–16 | Phase F: Data + Backend | Fresh data, deploy, load test, monitoring | 4 days |
| Apr 17–23 | Phase G: Reddit Launch | Seed posts, reveal, community, analytics | 1 week |
| **Apr 24–26** | **NFL Draft Week** | **Brand presence established** | — |
