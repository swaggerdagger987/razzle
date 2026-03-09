# Razzle Development Roadmap

**NFL + College Football — The Complete Data Platform**
**From Design Document to NFL Draft Launch**
**Hard Deadline: NFL Draft Week**

---

## Strategic Framing

Your goal is to have a free tool on Reddit that dynasty and fantasy power users can't stop screenshotting. Everything else follows from that.

### Why College Data Is a Launch Weapon

Your Reddit launch window is NFL Draft season. What are dynasty managers obsessing over during draft season? Incoming rookies. Their college production. Their film grades mapped to statistical profiles. College data isn't an add-on — it's the centerpiece of your launch content strategy.

A Lab screener that lets a dynasty manager filter incoming prospects by college EPA, target share, yards after contact, breakaway rate, and dominator rating — that's a post that gets 500 upvotes on r/DynastyFF during draft week. That's the screenshot that builds your brand.

The dual-data approach also creates a moat. Plenty of tools have NFL stats. Very few have NFL + college in one unified screener with custom formulas that work across both. That's a genuine differentiator.

### The Data Sources

| Layer | Source | What It Provides | Access |
|---|---|---|---|
| NFL Stats | nflverse (nflreadr, nflfastR) | Play-by-play, box scores, snap counts, EPA, CPOE, target share, air yards, 100+ columns | Open source, CSV/parquet, no API key needed |
| College Stats | CollegeFootballData.com (CFBD) | Player stats, PPA/EPA, usage rates, recruiting, play-by-play, advanced metrics | Free API key (1,000 calls/mo free tier). Python package: cfbd |
| College Supplemental | cfbfastR / Sportsdataverse | R/Python wrappers for CFBD + ESPN data. Recruiting composites, transfer portal | Open source, wraps CFBD API + ESPN endpoints |
| League Context | Sleeper API | Leagues, rosters, transactions, draft picks, matchups | Free, no key required. Rate-limited. |

### What Ships By Draft Week vs. What Doesn't

| Ships Pre-Draft | Ships Later (Summer / Season) |
|---|---|
| The Lab: NFL screener (nflverse data) | Formula Store (marketplace) |
| The Lab: College screener (CFBD data) | Full War Room (6 agents, paid tier) |
| NFL ↔ College toggle / unified view | League Intel (behavioral profiles) |
| Custom formula builder (works on both datasets) | Auth + Stripe payments |
| Radar charts + scatter plots (both datasets) | Agent memory / The Elephant |
| Shareable URLs with watermark | Weekly briefings |
| Image export (Share to Reddit) | NFL Combine / Pro Day data integration |
| Landing page with War Room teaser | Draft capital weighting (pick value models) |
| Basic Sleeper connection (show leagues) | Transfer portal tracking |
| Rookie prospect cards (college stats for incoming class) | AdSense integration |

This is not cutting corners. This is the correct sequencing. You build the growth engine first, then the monetization engine. Reddit doesn't care about your paid tier. Reddit cares about a free tool that makes them look smart in their league chat.

---

## Unified Data Architecture

The adapter pattern from the design doc is even more critical now. Two data universes — NFL and college — must land in the same screener with the same formula system. The architecture makes this clean:

### Adapter Pattern (Updated)

```
live_data.py  (serving layer — reads from SQLite only)
    ↑
adapters/
    nflverse_adapter.py   → normalizes nflverse CSVs → common NFL schema
    cfbd_adapter.py       → normalizes CFBD API data → common college schema
    sleeper_adapter.py    → pulls leagues/rosters/transactions
    [future] nflpa_adapter.py
    ↓
data/terminal.db (SQLite)
    └─ nfl_players       (NFL career + season + weekly stats)
    └─ cfb_players       (college career + season stats)
    └─ player_mapping    (college ↔ NFL player ID crosswalk)
    └─ user_formulas     (formula definitions, flagged NFL/CFB/both)
```

### College Stats Available via CFBD

| Category | Metrics | Dynasty Relevance |
|---|---|---|
| Passing | Completions, attempts, yards, TDs, INTs, adjusted EPA, PPA per play, completion % by depth | Evaluate QB prospects, compare college efficiency to projected NFL translation |
| Rushing | Carries, yards, YPC, yards after contact, breakaway runs (10+ yards), TDs, stuff rate | RB prospect profiles, contact balance, big-play ability |
| Receiving | Receptions, targets, yards, TDs, yards per route run, target share, dominator rating | WR/TE breakout detection, alpha WR identification |
| Usage / Snap | Snap counts, snap share, opportunity share, carries + targets per game | Workload projection, role clarity vs. committee |
| Efficiency | PPA (predicted points added), EPA, success rate, explosive play rate | Quality-adjusted production, not just volume |
| Recruiting | 247 composite rating, star ranking, position rank, recruit class | Athletic pedigree as a dynasty signal — correlates to draft capital |
| Team Context | Conference, team record, strength of schedule, offensive scheme | Normalizing production against competition quality |

### The College–NFL Bridge

The `player_mapping` table is what makes this platform special. It links a college player's CFBD ID to their nflverse ID once they enter the NFL. This enables:

- **Prospect cards:** college career stats displayed alongside any NFL data (for rookies who have played)
- **Career arc charts:** trend lines that span college seasons into NFL seasons seamlessly
- **Cross-dataset formulas:** weight both college efficiency and NFL production in one composite score
- **Draft class screeners:** filter the incoming class by college stats, compare to historical NFL outcomes

For launch, the mapping can be manual for the current draft class (~250 players) and automated later via name + school + position matching.

---

## Phase 0: Foundation

Clean repo, working local dev, BOTH data pipelines confirmed. Zero feature work — just scaffolding.

| # | Task | Detail | Done When |
|---|---|---|---|
| 1 | Fresh repo + structure | GitHub repo. Folders: /frontend, /backend, /data, /adapters, /scripts. No framework — vanilla HTML/JS/CSS. | git clone works, folder structure in place |
| 2 | nflverse adapter | nflverse_adapter.py: fetch CSVs, normalize to common schema, write to SQLite (terminal.db → nfl_players). | `python adapters/nflverse_adapter.py` populates nfl_players with 2023–25 data |
| 3 | CFBD adapter | cfbd_adapter.py: register for free API key. Pull player season stats, recruiting data, PPA. Write to cfb_players table. | `python adapters/cfbd_adapter.py` populates cfb_players with 2022–25 college data |
| 4 | Player mapping table | Build player_mapping crosswalk for current draft class. Manual CSV for now — ~60 top prospects. CFBD ID → nflverse ID (once drafted) + name/school/position. | Mapping table populated for top 60 prospects |
| 5 | Serving layer | live_data.py: Flask/FastAPI. Endpoints: GET /api/nfl/players, GET /api/cfb/players, GET /api/prospects. All return JSON. | curl returns player data from both tables |
| 6 | Local dev + deploy | Frontend served locally. API calls work. Push to Render with SQLite. | yourapp.onrender.com returns NFL + college data |

**CFBD API note:** The free tier gives 1,000 calls/month. During Phase 0, cache aggressively — pull once, store in SQLite, serve from local DB. The adapter should be idempotent: re-running it only fetches new/changed data. You can upgrade to a paid CFBD tier ($5–10/mo via Patreon) later if you need more calls for live updates during the season.

**Exit criterion:** You can hit your API and get real NFL player stats AND college player stats from SQLite. Both pipelines run cleanly. No UI yet — just plumbing.

---

## Phase 1: The Lab — Core Screener

This is the single most important phase. The screener is your product. It needs to work for BOTH NFL and college data from day one.

| # | Task | Detail | Done When |
|---|---|---|---|
| 1 | Data mode toggle: NFL / College | Top-level toggle switches the screener between NFL and college datasets. URL param: ?mode=nfl or ?mode=cfb. Column sets update accordingly. | Toggle switches data; URL reflects mode |
| 2 | NFL screener table | Sortable, filterable table. 100+ nflverse columns. Horizontal scroll. Sticky player name. Position filter tabs. | NFL table renders all players with sort + filter |
| 3 | College screener table | Same table architecture, college columns: PPA, usage, recruiting composite, conference, team, season. Position filter tabs. | College table renders with full CFBD stats |
| 4 | Advanced filtering | Multi-condition filter: stat > threshold AND/OR logic. Works on both NFL and college columns. Persists in URL. | Can filter college players: target share > 20% AND PPA > 0.3 |
| 5 | Column picker + presets | Toggle visible columns. Presets differ by mode: NFL (PPR, dynasty, efficiency) vs. College (prospect eval, draft, recruiting). | Presets load correct columns per mode |
| 6 | Season / year selector | NFL: season + weekly. College: multi-season career view (2022–25). | Can view player's full college career stats |
| 7 | Prospect view | Combined mode: incoming draft class with college stats. If player already has NFL data, show both via mapping table. | Draft class visible with college production |
| 8 | Search + URL state | Search bar. Full state serialized to URL: mode, filters, sort, columns, search term. | Share URL → exact same view, including mode |

### Design Direction

Dense data. Monospace numbers. The density IS the feature — it signals to Reddit power users that this is a serious tool.

The NFL/College toggle should feel like switching between asset classes on a Bloomberg terminal, not like switching between two separate apps. Same UI, same interaction patterns, different data universe.

**Exit criterion:** The Lab loads with a clean NFL/College toggle. Both datasets are filterable, sortable, and shareable via URL. The college screener feels just as dense and powerful as the NFL one.

---

## Phase 2: Formulas + Visualizations

This is where The Lab goes from useful to viral. Custom formulas are the "look what I built" hook. Radar charts are the "look at this player comparison" hook. Both work on NFL and college data.

| # | Task | Detail | Done When |
|---|---|---|---|
| 1 | Formula builder (dual-mode) | Stat dropdowns populated from current mode (NFL or college columns). Formulas tagged as NFL, CFB, or universal. Weight sliders + name field. | User creates college formula → appears as sortable column in college screener |
| 2 | Cross-dataset formulas | Universal formulas use stats available in both datasets (e.g., yards, TDs, target share). Flagged as "universal" — work in either mode. | A universal formula shows correct values in both modes |
| 3 | Formula persistence | Save to localStorage. Load on return. Encode in shareable URL (including formula definition). | Formulas survive refresh and are shareable |
| 4 | Radar charts | 5–6 stat pentagon. Works for NFL or college players. Overlay two players — including cross-dataset (NFL vet vs. college prospect on shared stats). | Radar: college WR vs. NFL WR on target share, YPR, etc. |
| 5 | Scatter plots | Any stat vs. any stat. Color by position. Works in both modes. Clickable dots with tooltips. | Scatter plot of college PPA vs. target share with player labels |
| 6 | Trend charts | NFL: stat over weeks/seasons. College: stat over seasons. Multi-player overlay. | Show a prospect's college production arc across 3 seasons |
| 7 | Comparison mode | Side-by-side player cards with stat overlays and radar charts. Cross-dataset: compare NFL player to college prospect on overlapping metrics. | Pick Ja'Marr Chase (NFL) vs. college WR1 → see comparison |

**Exit criterion:** You can create a "Prospect Score" formula using college stats, sort the screener by it, open a radar chart comparing a college prospect to an NFL comp, and the whole thing looks like something that would trend on r/DynastyFF during draft season.

---

## Phase 3: Sharing Engine + Watermark

Without this phase, everything you built is invisible. With it, every screenshot is a billboard.

| # | Task | Detail | Done When |
|---|---|---|---|
| 1 | Watermark | CSS-positioned: "razzle.lol" in bottom-right. Always visible, semi-transparent. Shows in both NFL and college modes. | Watermark visible on Lab page at all times |
| 2 | Image export | HTML Canvas render of current view. Watermark baked in. Download as PNG. Works for tables, charts, and comparisons. | Click export → get PNG with watermark |
| 3 | Share to Reddit button | Formats image cleanly for Reddit. Title suggestion auto-generated. Direct link back to Razzle URL. | One click → image + suggested post ready |
| 4 | Shareable URL polish | All state serializes cleanly including mode (NFL/CFB). Preview card (og:image) for link posts on Reddit/Discord. | Share a link → preview card shows with Razzle branding |

**Exit criterion:** Every screenshot or link shared from Razzle drives traffic back. The watermark is tasteful but unmissable. Sharing flow is frictionless for both NFL and college views.

---

## Phase 4: Landing Page + Sleeper + Prospect Cards

The front door, the conversion funnel entry, and the draft-season killer feature: prospect cards that combine college production with Sleeper roster context.

| # | Task | Detail | Done When |
|---|---|---|---|
| 1 | Landing page | Hero section: tagline + CTA to Lab. Sections: Lab preview (show BOTH NFL + College), agent teasers, War Room demo placeholder. | Landing page looks sharp, highlights dual-data |
| 2 | War Room demo (static) | 10–15 pre-built anonymized demo scripts. Agents "working" with redacted outputs. Rotates on load. | Demo plays on landing page, looks compelling |
| 3 | Sleeper connection flow | Input Sleeper username → fetch leagues → display rosters on league-intel.html. | User enters username → sees their leagues |
| 4 | League Intel (free tier) | Leagues, rosters, standings, bye weeks, position depth. Clean, useful, free. | Connected user sees their league structure |
| 5 | Prospect cards | Dedicated view for incoming draft class. College stats + radar chart + recruiting composite + NFL comp suggestion (based on similar college profiles). These are THE draft-week content. | Prospect card for a WR shows 3-year college arc + radar + comp |
| 6 | Waitlist / email capture | Email capture for War Room launch. Store in DB or Mailchimp. | Users can sign up for paid tier notifications |

**Exit criterion:** New visitor lands on home, sees dual-data pitch, explores Lab (both modes), connects Sleeper, views prospect cards for incoming class, and optionally joins waitlist.

---

## Phase 5: Reddit Launch

Sustained campaign. Seed content across subreddits using The Lab as the content. College data is your edge during draft season.

### Launch Playbook

| Step | Action | Detail |
|---|---|---|
| 1 | Seed posts (college data) | Post 3–4 high-value prospect analysis posts on r/DynastyFF. Use college screener screenshots. "The 5 dynasty WR prospects with the highest college dominator ratings since 2020." Watermark does the marketing. |
| 2 | Cross-post + engage | Respond to comments. Drop Lab links organically. Post NFL analysis on r/fantasyfootball to show the dual capability. |
| 3 | Tool reveal post | "I built a free Bloomberg terminal for fantasy football — with full NFL + college data." Show screener, formulas, prospect cards, radar charts. This is the launch post. |
| 4 | Prospect card blitz | Individual prospect breakdown posts using prospect cards. One per top prospect. Each is its own Reddit post with shareable link. |
| 5 | Sustain + r/SleeperApp | Post about Sleeper connection on r/SleeperApp. Monitor feedback. Fix bugs. Keep the content cadence going through draft week. |

### Subreddit Targeting

| Subreddit | Angle | Content Type |
|---|---|---|
| r/DynastyFF | Prospect evals, college production profiles, rookie rankings, NFL comps | Prospect cards + college screener screenshots |
| r/fantasyfootball | Redraft prep, NFL player analysis, breakout candidates | NFL screener + radar chart screenshots |
| r/NFL_Draft | Data-driven prospect analysis, college stat deep dives | College screener views + trend charts |
| r/SleeperApp | Sleeper integration, league insights | Feature showcase + Sleeper connection |
| r/FantasyFootballers | General analysis, tool recs | Cross-post best-performing content |
| r/CFB (selective) | College stat analysis for draft-eligible players | College screener analysis (be careful — not a fantasy sub) |

**New subreddit: r/NFL_Draft.** This is 300k+ subscribers all obsessing over the same thing your college screener does. Prospect analysis posts with real data will stand out in a sea of subjective mock drafts. This is potentially your highest-ROI subreddit during draft week.

---

## Post-Draft: Monetization Build

| Order | Focus | Deliverables |
|---|---|---|
| 1 | Auth + payments + mapping | Email/password registration, Stripe ($240/yr), Sleeper binding, JWT. Automate player_mapping for drafted rookies (CFBD ID → nflverse ID). |
| 2 | Agent infrastructure | Claude API integration, Razzle routing, agent personas. Use college data for rookie scouting reports. Free generic queries (rate-limited). |
| 3 | League Intel + memory | Full league history via previous_league_id, behavioral profiles, manager profiling. Track draft history + rookie hit rates using college-to-NFL mapping. |
| 4 | War Room + polish | All agents with full league context. Factor rookie projections (college-based) into championship probability. Formula Store v1. Load testing. |
| 5 | Season launch | Paid tier live. War Room open. Continue Reddit cadence through season. College screener stays live for dynasty rookie evaluation. |

---

## Daily Execution Rules

Non-negotiable principles for the build.

1. **One phase at a time.** Do not start Phase 2 until Phase 1's exit criterion is met. Partial completion across multiple phases is how projects die.
2. **Ship ugly, then polish.** A working screener with raw CSS beats a beautiful landing page with no product behind it. Design polish happens in Phase 3–4, not Phase 1.
3. **No auth until post-draft.** Auth, payments, and user accounts are complexity traps. Use localStorage for formulas. Use Sleeper usernames as pseudo-identity. Real auth comes later.
4. **College data is a first-class citizen.** Do not treat college as an afterthought bolted onto the NFL screener. It should feel equally powerful and equally dense from Phase 1 onward. Draft season IS your launch window.
5. **Every coding session ends with a deploy.** If it's not on Render, it doesn't exist. Deploy daily.
6. **Screenshot test daily.** Take a screenshot of The Lab — both modes — every day. Would a Reddit power user post this? If no, that's your priority.
7. **Reddit is the customer.** Every product decision gets filtered through: "Would this get upvoted on r/DynastyFF during draft week?" If no, it's not a priority.
8. **Cache aggressively, call APIs sparingly.** CFBD free tier = 1,000 calls/month. Pull once, store in SQLite, serve from local DB. Never call the API on a user request — always serve from cache.

---

## Risk Register

| Risk | Severity | Mitigation | Trigger to Act |
|---|---|---|---|
| Scope creep into agents/paid | High | Agents are post-draft. If you're building agent infra before Phase 5, stop immediately. | Any Claude API work before launch |
| CFBD API rate limits | Medium | Cache everything in SQLite. One-time pull per season. Upgrade to $5/mo Patreon tier if needed. Never call on user request. | Hitting 1,000 calls during data ingestion |
| CFBD data gaps / schema changes | Medium | CFBD API v2 is stable. Audit available endpoints in Phase 0. Build adapter to handle missing fields gracefully. | Missing expected stats in adapter output |
| nflverse data gaps | Medium | Audit columns in Phase 0. Build adapter to handle missing fields. Fallback to zeros with clear UI indicator. | Missing EPA/snap data in nflverse output |
| Player mapping quality | Medium | Start manual for top 60 prospects. Good enough for launch. Automate matching post-draft using name + school + position. | Mismatched players in prospect cards |
| Render cold start latency | Medium | SQLite is fast. Pre-warm. If cold starts > 3s, split static (Vercel) + API (Render). | User complaints about load times |
| Reddit self-promotion rules | High | Lead with value. Watermark does marketing. Link to Lab views, not home page. On r/NFL_Draft, post pure analysis. | Post removed by mods |
| Two-screener complexity | Medium | Same UI, same code, different data source. Do not build two separate UIs. The toggle is a data-layer switch, not a UI rewrite. | College screener diverging from NFL in design |
| Burnout / paralysis | High | Phase structure prevents overwhelm. Each phase is 5–10 days. Exit criteria are clear. One phase at a time. | Missing 2+ days without commits |

---

## Phase Summary

| Phase | Deliverable |
|---|---|
| 0 — Foundation | Repo + NFL & college pipelines + deploy |
| 1 — Lab: Screener | Dual-mode filterable data table |
| 2 — Lab: Formulas + Viz | Cross-dataset formulas + charts |
| 3 — Sharing Engine | Watermark + export + URLs |
| 4 — Landing + Sleeper + Prospects | Home page + prospect cards |
| 5 — Reddit Launch | Sustained content campaign |

---

*The Lab — with both NFL and college data — is the only thing that matters. Build the screener. Make it dense. Make it shareable. Let Reddit do the rest.*
