# North Star

**This document wins all arguments.** Every slice gets scored against it.

## The one number

**1,000 paid users.** During BUILD, chase the Trust Score (T1–T7) below. Everything else is a leading indicator.

**The one date: July 28, 2026.** The product is live and Reddit-shareable before draft season. Zero negotiation. Scope bends; the date does not.

## The ambition

Complete domination of fantasy football intelligence. The market is small enough to fly under the radar and big enough that if the Razzle brand sticks, it compounds for a generation. We are not building a feature — we are building the place serious players think from: **the Moneyball moment for AI in fantasy sports decisions**, the way analytics was for baseball front offices. Reddit subthreads are the entire distribution: keep giving real results to real players and the brand does the rest. (Positioning note: *we* may be described that way; the product itself never says "AI" — `spec/VOICE.md`.)

## The thesis

Razzle is a **fantasy football film room disguised as a Sunday comic strip**.

Warm sand, chunky borders, a Bengal tiger who doesn't hedge — and underneath, the kind of analysis that makes your leaguemate ask *"where did you get that?"* Not another dark-mode spreadsheet with a chatbot stapled on. The place obsessed fans go after Sunday night, when 90% of the week's scoring is done and you need to know **what happened, why, and what to do next week**.

> "Drake London saw 10 targets — three standard deviations above his baseline. That's why you lost."

That's Razzle. Not "consider monitoring your WR room."

## The valuation thesis (the core differentiator)

**Fantasy points are cash flows.** KeepTradeCut and consensus rankings are the *market approach* — what the crowd will pay today. Razzle is the **income approach**: a player's value is built from explicit inputs and assumptions — usage, efficiency, age curve, contract situation, *your* league's scoring — that the user can see and manipulate.

- **We publish methodologies, never black-box values.** Every number comes with its assumptions exposed. Users stress-test, tweak an input, and watch the value move.
- **The model build sheet (none of it exotic — the edge is scalability + finance discipline, not secret data):** current production baseline → positional age curve → team situation surplus/deficit (opportunity, target/carry competition, offense quality) → growth rate → translated through *your* league's scoring. Situational, per-player, per-league. Nobody has shipped this because nobody combined the finance understanding with the technology — that's the whole gap.
- The product was born from a real pain: the founder's biggest screen time was Safari + Sleeper, manually converging stats to make trade decisions. Razzle is that convergence, automated, under your league's rules.
- **Trade intelligence is the wedge.** The loop we own: converge stats → value players under your settings and assumptions → make the trade with conviction. Market price (consensus) is shown beside intrinsic value (yours) — the gap IS the trade thesis.

This is defensible precisely because it's transparent: anyone can copy a number, but a methodology users have stress-tested themselves becomes *their* methodology. That's trust.

## What we sell

**Trust.** Razzle wins when you trust it more than anything else for fantasy decisions — start/sit, trade, waiver, draft, dynasty hold/sell. Because the numbers are **yours** (your scoring, your league, your picks), the staff already know your league, and the product looks like a toy but performs like a briefing room.

**Brand line:** *The Screener is forever free. The intelligence is what you pay for.* "Intelligence" = depth of understanding, never a model badge (`spec/VOICE.md`).

## The four rooms (one operation, four doors)

One intelligence agency, four floors. Same lens everywhere: **what happened → why → what's next.**

| Room | What it is | Holy moment |
|------|-----------|-------------|
| **Explore** — the files | NFL + college stats screener. Free forever. Filter, sort, share a URL, export a watermarked card. | You build **your** value formula and the table finally ranks players the way your brain does. |
| **Lab** — R&D | Where obsessed players test theories: custom formulas, valuation assumptions, strategy backtests ("what if I only draft players on expiring contracts?"). The valuation workbench lives here. | Group chat says Player X is washed. You end the argument with one Lab screenshot of your model. |
| **Bureau** — the CIA | **Constant monitoring.** It doesn't wait to be asked: it watches the league, explains what happened, and predicts what's next — "Manager X projects to go heavy on RBs before the deadline." Playoff odds, relative value under your rules, manager profiles. | Real playoff probabilities, then deeper: who owns the most injury-prone roster, who's actually competing with you for that WR2, who's about to panic-sell. |
| **Situation Room** — the briefing | Where you go when you need someone to talk to — and the room **already knows**. You never have to say "X just got injured": the intel is already on the floor, Dr. Dolphin already has the injury history and a real timeline, and the impact is quantified for *your* league. | CMC goes down. Before you finish typing, the room tells you your championship probability just moved from 30% to 18% — and what to do about it. |

## Player Sheet — the hub (not a fifth room)

The main way people explore, not a modal. Land on Saquon, switch to CMC, instant. From one sheet: who in **your league** owns him, what Hawkeye (usage) and Dolphin (health) say, paths into Lab panels and Bureau context, a line into the Room. Directional commitments: intelligent trade ideation, value watches, creative trade paths. **If a feature doesn't make the Player Sheet more useful, it's probably a silo.**

## Free vs paid

- **Free = obsession hook:** full stats browsing, a few Lab panels, a few custom-scoring experiments, Bureau summary on Sleeper connect.
- **Paid = trust for league decisions:** full Lab, Bureau deep-dive, Situation Room with full league context.
- **League plan (the second SKU, in-season):** one purchase covers the whole league — every manager gets access and the Bureau's weekly briefing lands in front of all of them. One sale = twelve funnel entries; the league group chat becomes a distribution surface. Razzle spreads *inside* leagues, not just on Reddit.

Free must be generous enough that fans fall in love — they pay when their **league** is on the line.

## The staff

| Who | Job | Shows up |
|-----|-----|----------|
| **Razzle** 🐯 | Chief of Staff. Verdict. No hedging. | Everywhere |
| **Dr. Dolphin** 🐬 | Medical. Injuries. Durability. | Everywhere there's player health |
| **Hawkeye** 🎯 | Scout. Usage. Breakouts. Tape. | Usage / breakout surfaces |
| **Bones** 🦴 | Diplomat. Trades. Leverage. | Trade / manager psychology |
| **Octo** 🐙 | Quant. Odds. Projections. EV. | Numbers that end arguments |
| **Atlas** 📚 | Historian. Career. League memory. | History / manager patterns |

Razzle says **"start him."** Other tools say "consider starting." Orchestration shape in `spec/STAFF.md`.

## The moat (ranked)

1. **League-relative decision quality** — your league, your rules, your picks.
2. **Compounding context** — more seasons → richer profiles → harder to leave.
3. **Data density done right** — in service of trust, not feature count.
4. **Community recognition** — r/DynastyFF knows the screenshots; switching mid-season hurts.

The moat is **not** "we use Claude." Anyone can rent a model. We're the context layer with a personality.

## Trust pillars (T1–T7) — how work is scored

| ID | Pillar | Pass question | Fail smell |
|----|--------|---------------|------------|
| **T1** | Decision trust | Would a serious manager act on this for a real decision? | Generic ranking noise |
| **T2** | League-relative | Customized to *this* league's rules, rosters, picks? | Static trade calc / redraft brain |
| **T3** | Player Sheet | Does the hub get better — land, switch, own, ask, link? | Dead-end page |
| **T4** | Film-room loop | Helps *what happened → why → what's next* (esp. post-Sunday)? | Feature with no weekly story |
| **T5** | Lab invention | Labeled data becomes a visual, shareable dashboard? | JSON dump / unstyled table |
| **T6** | Screenshot gravity | Helpful in a group chat; Razzle colors + watermark recognizable? | Generic SaaS gray |
| **T7** | Free-tier obsession | Free deepens love without giving away paid trust? | Paywall rage / empty free tier |

**Minimum to ship a slice:** T1 + at least one of T3–T5, plus gates in `factory/GATES.md`.

## Instant VETO (do not merge)

- User-facing copy leads with "AI" (`spec/VOICE.md`)
- Generic advice that ignores league context when context exists
- Silo with zero Player Sheet or cross-room path
- Horizontal sprawl (auth polish, marketing site) advancing no Trust pillar
- Violates `spec/DESIGN.md` (gradients, thin borders, cold fintech vibes)

## Decision framework (in order)

1. Does this increase trust for a real decision? (T1)
2. Is it true for *their* league, not fantasy in general? (T2)
3. Does it strengthen the Player Sheet hub? (T3)
4. Does it help the post-Sunday film-room loop? (T4)
5. Would a dynasty manager screenshot this for the *data*? (T6)
6. Does it match `spec/DESIGN.md`? Sand, chunky, comic energy, warm not cold.
7. Is this the simplest complete version? Ship, then deepen.
8. Does it move toward 1,000 paid users — directly or via a Trust pillar?

If 1–4 are all no and it's not infrastructure, **KILL the slice**.

## Who we're for

**Primary:** dynasty power users on r/DynastyFF — year-round, tool-heavy, allergic to generic ChatGPT takes. **Secondary:** serious redraft players who arrive through screenshots and Bureau hooks.

Pain we own: *"ChatGPT doesn't know my scoring settings." "Six tabs open for one trade." "I know Dave panics after losses — I can't prove it." "Sunday night and I still don't know why I lost."*

## Distribution — the trade-reply doctrine

**We never promote Razzle.** No launch posts, no ads, no "check out my tool." The engine is demand capture:

Niche trade threads (r/DynastyFF and friends) have a massive surplus of people *asking* trade questions over competent people *answering* them. OPs love any interaction on their post. That asymmetry is the white space. The play: reply to real trade questions with a small, chill, competent explanation — alongside a Razzle screenshot that shows the reasoning. The answer is the marketing; the watermark does the rest. Catch a few threads and it spreads on its own; the engine is slow but it never burns out.

Flywheel: trade answer → screenshot with reasoning → watermark → free Explore → Sleeper connect → Bureau hook → paid trust.

**Product law that follows:** every shareable surface must work as a *trade answer*. The canonical Razzle screenshot is a side-by-side comparison — players and picks, valued under the asker's league settings, assumptions visible. If an export can't answer "who wins this trade?", it's not the priority export.

Posting under the Founder's identity is Founder-only.

## Playfulness is not optional

Warm, human, slightly quirky beats enterprise-serious for tools people live in daily. Loading copy: *"pulling film..."* Tiger who's smug because the numbers back it up. Dry wit in the margins; never cringe, never corporate. **If a PR makes Razzle feel like a fintech dashboard, T6 fails even if tests pass.**

## The line

We're testing weekly what's stronger — **our bad luck or the numbers.** Come join us. Bring your league. Razzle already pulled the film.
