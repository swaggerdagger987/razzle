# Razzle — North Star

**This is the center of gravity.** When agents, cofounders, or humans disagree, this document wins.

Every slice, standup, and PR gets scored against **§ How we score work** below. Not vibes. Not "shipped something." Trust, league truth, and the film-room loop.

---

## The one number

**1,000 paid users.**

Everything else is a leading indicator until we're live. During BUILD, agents chase the **Trust Score** (T1–T7). When we're in DISTRIBUTION, this number is the only score that matters.

---

## The thesis (read this out loud)

Razzle is a **fantasy football film room** disguised as a Sunday comic strip.

Warm sand, chunky borders, a Bengal tiger who doesn't hedge — and underneath, the kind of analysis that makes your leaguemate ask *"where did you get that?"*

We are not building another dark-mode spreadsheet with a chatbot stapled on. We're building the place obsessed fans go after Sunday night — when **90% of the week's scoring is done** and you need to know **what happened, why, and what to do next week.**

> *"Drake London saw 10 targets — three standard deviations above his baseline. That's why you lost."*

That's Razzle. Not "consider monitoring your WR room."

---

## What we're actually selling

**Trust.**

Razzle wins when you trust it **more than anything else** for fantasy decisions — start/sit, trade, waiver, draft pick, dynasty hold/sell.

Not trust because we said so. Trust because:

- The numbers are **yours** (your scoring, your league, your picks).
- The staff **already know your league** before you ask.
- The product **looks like a toy** and performs like a briefing room.

**Brand line:** *The Screener is forever free. The intelligence is what you pay for.*

"Intelligence" = depth of understanding. Not a model badge. See `docs/v2/VOICE.md` — we sell obsession with football, not AI.

---

## The four rooms (one operation, four doors)

Think less "four tabs" and more **one intelligence agency** with different floors. Same theme, same lens: **find out what happened → plan for next week.**

```
     Explore          Lab              Bureau           Situation Room
   (the files)    (the invention      (the resources      (the briefing)
                   floor)              desk)
        │              │                  │                    │
        └──────────────┴──────────────────┴────────────────────┘
                                    │
                          Player Sheet (the hub)
```

### Explore — the files

NFL + college player stats. The front door. Free enough to fall in love with.

**Holy moment:** You build **your** value formula — the stats *you* overweight — and the table finally matches how your brain ranks players. Not someone else's composite from a podcast.

Browse NFL and college. Filter. Sort. Share a URL. Export a card with our colors and a watermark in the bottom-right. Over time, fans recognize Razzle from the screenshot alone. The image should be **helpful first**; the brand follows from repetition.

*Explore is where obsession starts.*

### Lab — the invention floor

This is the CIA room where someone is always prototyping the next chart. Once data is labeled and formatted, dashboards should be **easy to spin up** — live, visual, arguable.

**Holy moment:** You're in the group chat. Someone claims Player X is washed. You pull up a Lab dashboard — your pivot table from hell, but pretty — and the argument ends with a screenshot.

Lab is not "70 panel names in a sidebar." Lab is **research artillery**: an insane pivot-table creator for NFL player dashboards. Power users live here. The exact free/premium line inside Lab is **Founder TBD** — ship depth and screenshot-worthiness until that's locked. See `docs/v2/DEPTH.md` (Lab L0–L5).

*Lab is where arguments get won.*

### Bureau of Intelligence — the resource desk

Imagine Mossad and the CIA decided your fantasy team was the only asset that mattered. Playoff odds. Relative value **in your league** — dynasty, keeper, or redraft, with **your** rules, not a generic trade calculator that treats every league like redraft PPR.

**Holy moment:** Real playoff probabilities — then deeper cuts: who owns the most injury-prone roster, average age of every team's superstars, who you're actually competing with for that WR2 spot.

Generic advice is everywhere. **League-relative truth** is the moat.

Free: connect Sleeper, see enough to feel the hook (summary odds, roster context). Pro: the full briefing. See `docs/v2/DEPTH.md` (League L0–L5).

*Bureau is where "better than my leaguemate's take" becomes measurable.*

### Situation Room — the briefing

The President walks in: **"What the hell is going on?"**

Six staff on the floor. Razzle delivers the verdict. Everyone else had a turn already.

**Holy moment:** A trade just happened — in your league or the NFL. You drop the screenshot. *How does this change the balance of power?* Or it's Monday morning and you need the autopsy: why you won, why you lost, what to do before waivers.

Especially **after Sunday night.** Obsessed fans don't want a recap podcast. They want **their** league, **their** players, **their** anomaly — with staff who point you through it.

The Room is a **film room**, not a chat product. Same six characters everywhere (`packages/agents/`): Razzle, Dr. Dolphin, Hawkeye, Bones, Octo, Atlas. Internal code may say `agents`; users see **staff**.

*Room is where the week gets interpreted.*

---

## Player Sheet — infrastructure (not a fifth room)

The Player Sheet is the **hub**. Not a nice modal — the main way people explore.

You land on Saquon. You switch to CMC. Instant. Clean.

From one sheet you should see:

- Who in **your league** owns this player
- What **Hawkeye** (usage) and **Dolphin** (health) say
- Paths into Lab panels and Bureau context
- A line into the Situation Room ("ask the staff")

**North Star commitments (directional — build in slices):**

- **Intelligent trade ideation** — e.g. "I want WR + TE for this hero RB" — because trades die from **ideation friction** and **fear of looking dumb**, not lack of stats
- **Value watches** — aggressive alerts when a player's market moves
- **Creative trade paths** — linked to real roster needs, not static "Player A > Player B"

If a feature doesn't make the Player Sheet more useful, it's probably a silo. See `docs/v2/HALLWAY.md` for wiring rules.

---

## Free vs paid (honest version)

**Free = obsession hook**

- Browse NFL + college player stats
- A **few** Lab panels (enough to taste the invention floor)
- A **few** custom scoring experiments (enough to feel "this is *my* formula")
- Bureau **summary** when Sleeper is connected — enough to want the deep dive

**Paid = trust for league decisions**

- Full Lab power (dashboard factory, depth panels)
- Bureau deep-dive (relative value, behavior, scenarios)
- Situation Room with full league context on the floor

We are not tricking anyone. Free should be **generous enough that fans fall in love with the idea** — then pay when their **league** is on the line.

Pricing details live in `docs/DECISIONS.md` and the product surface; this doc cares about **philosophy**, not Stripe SKUs.

---

## The staff (Situation Room)

| Who | Job | When they show up |
|-----|-----|-------------------|
| **Razzle** 🐯 | Chief of Staff. Verdict. No hedging. | Everywhere |
| **Dr. Dolphin** 🐬 | Medical. Injuries. Durability. | **Everywhere** there's player health |
| **Hawkeye** 🎯 | Scout. Usage. Breakouts. Tape. | Usage / breakout surfaces |
| **Bones** 🦴 | Diplomat. Trades. Leverage. | Trade / manager psychology |
| **Octo** 🐙 | Quant. Odds. Projections. EV. | Numbers that end arguments |
| **Atlas** 📚 | Historian. Career. League memory. | History / manager patterns |

Razzle says **"start him."** Other tools say "consider starting." We're not other tools.

Orchestration: question → Razzle routes 1–2 specialists → synthesis with urgency (URGENT / MONITOR / OPPORTUNITY / ROUTINE). Details in `docs/v2/AGENTS.md` and `agent-personas/`.

---

## The moat (ranked honestly)

1. **League-relative decision quality** — Sleeper → behavior → prompts. Your league, your rules, your picks.
2. **Compounding context** — more seasons → richer profiles → harder to leave.
3. **Data density done right** — formulas, dashboards, Bureau sims — in service of trust, not feature count.
4. **Community recognition** — r/DynastyFF adopts the screener screenshots; switching mid-season hurts.

The moat is **not** "we use Claude." Anyone can rent a model. We're the **context layer** with a personality.

---

## How we score work (LLM center of gravity)

**Every cycle, PR, and design review gets scored here.** Log the score in `docs/v2/results.tsv` (add notes in the `description` column) and standups.

### Trust pillars (T1–T7)

| ID | Pillar | Pass question | Fail smell |
|----|--------|---------------|------------|
| **T1** | **Decision trust** | Would a serious manager act on this for a real decision? | Generic ranking noise |
| **T2** | **League-relative** | Is it customized to *this* league's rules, rosters, picks? | Static trade calc / redraft brain |
| **T3** | **Player Sheet** | Does the hub get better — land, switch, own, ask, link? | Dead-end page |
| **T4** | **Film-room loop** | Does it help *what happened → why → what's next* (esp. post-Sunday)? | Feature with no weekly story |
| **T5** | **Lab invention** | Does labeled data become a visual, shareable dashboard or formula view? | JSON dump / unstyled table |
| **T6** | **Screenshot gravity** | Helpful in a group chat; Razzle colors + watermark recognizable? | Generic SaaS gray |
| **T7** | **Free-tier obsession** | Does free deepen love without giving away paid trust? | Paywall rage / empty free tier |

**Minimum to ship a slice:** T1 + at least one of T3–T5, plus Reality Checker execution evidence (`docs/v2/ACCEPTANCE.md`).

### Instant VETO (do not merge)

- User-facing copy leads with **"AI"** (see `VOICE.md`)
- Generic fantasy advice that ignores league context when context exists
- Silo shipped with **zero** Player Sheet or cross-room path
- Horizontal sprawl (new auth polish, marketing site) with no Trust pillar advanced
- Violates `docs/DESIGN.md` (gradients, thin borders, cold fintech vibes)
- Touches Founder-only boundaries in `docs/company/AUTOMATION.md`

### Depth + hallway (execution layer)

Vertical depth without wiring is a **silo**. Every ship passes:

- **Pillar + layer** cited from `docs/v2/PARITY.md` and `docs/v2/DEPTH.md`
- **Hallway checklist** from `docs/v2/HALLWAY.md` (Player Sheet, league bar, Dolphin on injury, etc.)

Legacy Razzle (V1, `legacy/`) is a **pitstop**, not the ceiling. Port what works; then go deeper than we ever did.

---

## Decision framework (in order)

When anything forks, ask:

1. **Does this increase trust for a real decision?** (T1)
2. **Is it true for *their* league, not fantasy in general?** (T2)
3. **Does it strengthen the Player Sheet hub?** (T3)
4. **Does it help the post-Sunday film-room loop?** (T4)
5. **Would a dynasty manager screenshot this for the *data*?** (T6)
6. **Does it match the design guide?** Sand, chunky borders, comic energy, warm not cold — `docs/DESIGN.md`
7. **Is this the simplest complete version?** Karpathy rules. Ship, then deepen.
8. **Does it move us toward 1,000 paid users** — directly or via a Trust pillar?

If 1–4 are no and it's not infrastructure, **KILL** the slice.

---

## Who we're for

**Primary:** Dynasty power users on r/DynastyFF — year-round, tool-heavy, allergic to generic ChatGPT takes.

**Secondary:** Serious redraft players who discover us through screenshots and Bureau hooks.

Pain we own:

- *"ChatGPT doesn't know my scoring settings."*
- *"Six tabs open for one trade."*
- *"I know Dave panics after losses — I can't prove it."*
- *"Sunday night and I still don't know why I lost."*

---

## Distribution (Founder-led)

**Reddit only** for GTM until stage advances. See `docs/v2/REDDIT.md`.

Agents research and feed the build queue (`docs/v2/REDDIT-INTEL.md`). **Posting under the Founder's identity is Founder-only.**

The flywheel: helpful screenshot → group chat / Reddit → watermark → free Explore → Sleeper connect → Bureau hook → paid trust.

---

## Vision vs shipped (don't lie to yourselves)

This North Star describes **where we're going**. Operational truth:

| Doc | What's actually built |
|-----|------------------------|
| `docs/v2/STATUS.md` | Live focus, cycle, blockers |
| `docs/v2/PARITY.md` | Backlog rows and RED/YELLOW/GREEN |
| `docs/v2/FEATURES.md` | Milestone flags |
| `docs/v2/results.tsv` | Cycle ledger |

If docs conflict, fix the conflict in the next standup. **Inventing shipped features is a Reality Checker FAIL.**

Known directionally-not-done (still North Star): intelligent trade builder, full formula store, ESPN/Yahoo, every Lab panel at L5, zero `legacy_bridge` imports. Track in PARITY; don't pretend here.

---

## Technical truth (pointer)

Stack, hosting, auth, billing: **`docs/DECISIONS.md`**. Agents don't re-debate Next.js vs vanilla HTML here.

Data flow in one line: **Sleeper + nflverse → terminal.db → Bureau/Room context → staff prompts.**

---

## Economics (short)

Lifestyle business. ~90% margin at scale. BYOK users cost little to serve. Breakeven is modest; **1,000 paid users** is the real goal. Seasonality details in prior planning docs — not scoring-critical.

---

## Playfulness is not optional

Anthropic figured out that **warm, human, slightly quirky** beats **enterprise serious** for tools people live in daily. We're the same bet for fantasy:

- Loading copy: *"pulling film..."* not *"Loading..."*
- Tiger mascot who's smug because the numbers back it up
- Sunday comics surface, briefing-room substance
- Dry wit in the margins; never cringe, never corporate

If a PR makes Razzle feel like a fintech dashboard, **T6 fails** even if tests pass.

---

## Related docs (read after this)

| Doc | Role |
|-----|------|
| `DESIGN.md` | Colors, type, voice, visual law |
| `DECISIONS.md` | Locked architecture |
| `company/HARNESS.md` | **Factory setup** — GitHub, CI, Slack, Automations |
| `company/FACTORY-VISION.md` | 24/7 factory, Stage D, North Star compounding |
| `company/SLACK-FORMATS.md` | CEO Slack notification tiers |
| `v2/DEPTH.md` | L0–L5 per pillar |
| `v2/HALLWAY.md` | Wiring checklist |
| `v2/PARITY.md` | Next slice queue |
| `v2/ACCEPTANCE.md` | Localhost gates |
| `v2/VOICE.md` | No "AI" marketing |
| `company/STAGE.md` | BUILD vs launch stages |
| `company/OPERATING_SYSTEM.md` | How build agents run |

---

## The line

We're testing weekly what's stronger — **our bad luck or the numbers.**

Come join us. Bring your league. Razzle already pulled the film.
