# North Star

**This document wins all arguments.** Every slice gets scored against it.

## The one number

**1,000 paid users.** During BUILD, chase the Trust Score (T1–T7) below. Everything else is a leading indicator.

## The thesis

Razzle is a **fantasy football film room disguised as a Sunday comic strip**.

Warm sand, chunky borders, a Bengal tiger who doesn't hedge — and underneath, the kind of analysis that makes your leaguemate ask *"where did you get that?"* Not another dark-mode spreadsheet with a chatbot stapled on. The place obsessed fans go after Sunday night, when 90% of the week's scoring is done and you need to know **what happened, why, and what to do next week**.

> "Drake London saw 10 targets — three standard deviations above his baseline. That's why you lost."

That's Razzle. Not "consider monitoring your WR room."

## What we sell

**Trust.** Razzle wins when you trust it more than anything else for fantasy decisions — start/sit, trade, waiver, draft, dynasty hold/sell. Because the numbers are **yours** (your scoring, your league, your picks), the staff already know your league, and the product looks like a toy but performs like a briefing room.

**Brand line:** *The Screener is forever free. The intelligence is what you pay for.* "Intelligence" = depth of understanding, never a model badge (`spec/VOICE.md`).

## The four rooms (one operation, four doors)

One intelligence agency, four floors. Same lens everywhere: **what happened → why → what's next.**

| Room | What it is | Holy moment |
|------|-----------|-------------|
| **Explore** — the files | NFL + college stats screener. Free forever. Filter, sort, share a URL, export a watermarked card. | You build **your** value formula and the table finally ranks players the way your brain does. |
| **Lab** — the invention floor | Research artillery: analytical panels and a pivot-table-from-hell dashboard factory. Pro depth. | Group chat says Player X is washed. You end the argument with one Lab screenshot. |
| **Bureau** — the resource desk | League-specific intelligence. Connect Sleeper once: playoff odds, relative value **under your rules**, manager profiles. | Real playoff probabilities, then deeper: who owns the most injury-prone roster, who you're actually competing with for that WR2. |
| **Situation Room** — the briefing | Six staff on the floor. Razzle delivers the verdict with an urgency tier. A film room, not a chat product. | Trade drops in your league. You paste it: *how does this change the balance of power?* |

## Player Sheet — the hub (not a fifth room)

The main way people explore, not a modal. Land on Saquon, switch to CMC, instant. From one sheet: who in **your league** owns him, what Hawkeye (usage) and Dolphin (health) say, paths into Lab panels and Bureau context, a line into the Room. Directional commitments: intelligent trade ideation, value watches, creative trade paths. **If a feature doesn't make the Player Sheet more useful, it's probably a silo.**

## Free vs paid

- **Free = obsession hook:** full stats browsing, a few Lab panels, a few custom-scoring experiments, Bureau summary on Sleeper connect.
- **Paid = trust for league decisions:** full Lab, Bureau deep-dive, Situation Room with full league context.

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

## Distribution

**Reddit only** until stage advances. The flywheel: helpful screenshot → group chat / Reddit → watermark → free Explore → Sleeper connect → Bureau hook → paid trust. Posting under the Founder's identity is Founder-only.

## Playfulness is not optional

Warm, human, slightly quirky beats enterprise-serious for tools people live in daily. Loading copy: *"pulling film..."* Tiger who's smug because the numbers back it up. Dry wit in the margins; never cringe, never corporate. **If a PR makes Razzle feel like a fintech dashboard, T6 fails even if tests pass.**

## The line

We're testing weekly what's stronger — **our bad luck or the numbers.** Come join us. Bring your league. Razzle already pulled the film.
