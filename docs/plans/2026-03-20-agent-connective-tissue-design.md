# Agent Connective Tissue Design

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Agent presence across Lab, Bureau, and Situation Room + Autoresearch self-improvement engine + MiroFish season simulation feature

---

## Problem

The six Situation Room agents (Razzle, Dr. Dolphin, Hawkeye, Bones, Octo, Atlas) are fully defined with rich personas and cross-trigger maps, but they're trapped in the Situation Room. They don't appear in the Lab or Bureau. The three products feel like separate tools instead of one intelligence platform. The agents should be the connective tissue — the personality layer that ties everything together.

## The Band

The agents operate like Kung Fu Panda — a band of equals, each a master of their domain. Razzle is the namesake whose name is on the door. When the team speaks, they speak with authority in their lane. When Razzle speaks, that's the verdict.

| Agent | Role | Character | One-liner |
|-------|------|-----------|-----------|
| **Razzle** | Chief of Staff | The namesake. Synthesizes, decides, delivers the verdict. | "Here's what we're doing." |
| **Dr. Dolphin** | Medical Analyst | The cautious protector. Unflinching truth about health. Saves you from yourself. | "I know you don't want to hear this." |
| **Hawkeye** | Scout | Cold-blooded signal hunter. No narratives, no emotion, just usage data. | "The data says what it says." |
| **Bones** | Diplomat | The honest broker. Finds deals that work for both sides. Keeps the trade market open. | "Here's how this trade gets done." |
| **Octo** | Quant | The transparent calculator. Shows the math, you decide. Confidence intervals over opinions. | "Here's what the numbers say." |
| **Atlas** | Historian | The archivist. Surfaces what everyone else forgot. The league's memory. | "This happened before. Here's when." |

### Decision Flow

- Each specialist speaks with authority in their domain — no deference required
- When it's decision time (start/sit, trade/hold, buy/sell) — Razzle synthesizes and delivers the final take
- The other five inform. Razzle decides.

---

## Three Layers of Agent Presence

### Layer 1: Personality (Free)

Agents are the voice of the UI. Not labeled, not explained — just felt.

- Loading states in each agent's voice (Caveat font):
  - Razzle: "pulling film..."
  - Dr. Dolphin: "checking the injury wire..."
  - Hawkeye: "scanning the tape..."
  - Bones: "reading the room..."
  - Octo: "running the numbers..."
  - Atlas: "pulling the archives..."
- Empty states with character:
  - Hawkeye: "Nothing worth your time right now."
  - Octo: "Insufficient data. Octo needs more."
  - Atlas: "No precedent found. That's rare."
  - Bones: "Market's quiet. Check back Wednesday."
- Margin notes in Caveat font on panels they own — small, skippable observations
- Subtle avatar icons (16-20px) next to columns and panel headers in their domain
- 404 page, error states, onboarding copy — all in Razzle's voice
- Users don't realize these are "AI agents" — they just feel like the site has personality

### Layer 2: Domain Ownership (Pro)

Agents visibly own their sections. Users start connecting the dots.

- Panel groups in Lab sidebar attributed to agents (small icon + name)
- Bureau sections have agent attribution headers
- Agent-voiced one-liner insights at the top of panels (static, contextual copy — not AI-generated)
- Locked Situation Room is visible — pixel agents walking around, demo briefing peekable
- Users recognize: "Oh, the dolphin from the injury column IS Dr. Dolphin in the war room"

### Layer 3: Alive (Elite)

The agents are watching your league and speaking to you directly.

- Proactive nudges on Lab/Bureau pages — small, dismissible, non-spammy callouts
  - One line max
  - Dismissible
  - Max 1 per page, max 5 per session
  - Rotate on refresh, don't stack
- Full Situation Room with real LLM conversations and cross-agent triggers
- Weekly briefings with league context
- Agent insights personalized to YOUR roster, YOUR rivals, YOUR league history
- Season Simulator (MiroFish) — see Section 7

---

## Agent Territory Map

### The Lab (Screener + Panels)

| Agent | Columns | Panels | Loading / Empty States |
|-------|---------|--------|----------------------|
| **Dr. Dolphin** | Injury status, games missed, durability score, workload flags | Injury report, durability rankings, workload sustainability | "checking the injury wire..." / "Clean bill of health. For now." |
| **Hawkeye** | Target share, snap %, route participation, WOPR, usage trends | Breakout finder, waiver wire, usage trends, rostership | "scanning the tape..." / "Nothing worth your time right now." |
| **Bones** | Trade value, buy/sell indicator, contract value | Trade values, buy-low/sell-high, trade finder | "reading the room..." / "Market's quiet. Check back Wednesday." |
| **Octo** | Projections, floor/ceiling, PPG, efficiency metrics, composite scores | Monte Carlo odds, projections, efficiency rankings, aging curves | "running the numbers..." / "Insufficient data. Octo needs more." |
| **Atlas** | Career stats, season-over-season delta, player comps | Career trajectories, historical comps, season recaps, game logs | "pulling the archives..." / "No precedent found. That's rare." |
| **Razzle** | None specifically — he IS the screener | None specifically — the Lab is his domain | "pulling film..." / Welcome state, 404, overall voice |

Agent attribution is subtle: 16px avatar in column header tooltip or panel subtitle. A whisper, not a label.

### The Bureau of Intelligence

| Agent | Bureau Section | What They Add |
|-------|---------------|---------------|
| **Dr. Dolphin** | Roster Depth Analysis | Health grades on starters vs bench. Durability concerns flagged. |
| **Hawkeye** | Self-Scout, Roster Depth | Usage trend arrows on your roster. Who's trending up, who's losing snaps. |
| **Bones** | Trade Finder, Trade Network, Pressure Map, Manager Profiles | His whole world. The Bureau's trade features ARE Bones' domain. |
| **Octo** | Monte Carlo Odds, Power Rankings, Strength of Schedule | The math engine. Championship probabilities, projection-based rankings. |
| **Atlas** | Manager Profiles, Transaction History, Build Profiles | Behavioral receipts. Multi-season patterns, draft tendencies, trade history. |
| **Razzle** | Overview / Executive Summary | Top-of-Bureau summary card. "Here's your league at a glance." The GM briefing. |

### The Situation Room

No architectural change — this is where the band plays together live. The difference is that by the time an Elite user arrives, they already know the agents from weeks of subtle contact across Lab and Bureau.

---

## Stitching Patterns

Three connective patterns that make Lab, Bureau, and Situation Room feel like one product:

### Pattern 1: Context Carries Forward

Player data from the Lab follows the user into Bureau and Situation Room via the existing localStorage context bridge. Agent references are consistent — Dr. Dolphin's injury flag on a player in the Lab appears as the same health grade in the Bureau's Self-Scout and the same context in a Situation Room briefing. No re-explaining.

### Pattern 2: Breadcrumb Nudges (Elite Only)

Small, dismissible, one-line callouts linking products through agent voices:

- Lab → Bureau: `Bones: 2 managers in your league need this position →` (links to Trade Finder)
- Bureau → Lab: `Dr. Dolphin: injury risk on your RB1 →` (links to injury panel)
- Bureau → Bureau: `Atlas: this manager sold low after losses 3 times last season →` (links to Manager Profile)
- Lab/Bureau → Situation Room: `Razzle: your agents have a briefing ready →`

Rules: one line max, dismissible, max 1 per page, rotate on refresh, never stack.

### Pattern 3: Situation Room Callbacks

When agents speak in the Situation Room, they reference things the user has already seen elsewhere:

> **Dr. Dolphin:** "You saw the durability flag on your RB1 in the Lab — I'm escalating that."

> **Atlas:** "Your trade partner accepted a similar deal last October. The Bureau transaction history backs this up."

The agents call back to the product, making the platform feel like one conversation.

---

## Autoresearch Self-Improvement Engine

### Overview

Agents optimize their own placement, copy, timing, and stitching behavior through a continuous self-improvement loop. Pre-launch: driven by synthetic user simulation. Post-launch: blended with real analytics.

### Model Allocation

| Component | Model | Rationale |
|-----------|-------|-----------|
| Synthetic user personas (navigation decisions) | Sonnet | High volume, 1000s of sessions — only place we save compute |
| Agent self-reflection | Opus | Each agent needs deep judgment to interpret their own domain data |
| Razzle strategy session | Opus | Cross-agent synthesis, arbitration, conversion funnel optimization |
| Peer review | Opus | Catching brand drift and territory conflicts requires nuance |
| New placement/copy generation | Opus | Creative work in-character needs the best model |
| Human veto dashboard summaries | Opus | Consistent with everything else |

### Loop 1: Synthetic User Simulation

Built on Playwright + LLM personas (Sonnet — the only component that uses Sonnet to keep simulation costs manageable at 1000+ sessions). No external dependency.

**Persona generation:** 20+ user archetypes with varying experience, engagement patterns, league formats, and goals. Examples:
- Dynasty veteran, 5 leagues, trades weekly, data-obsessed
- Redraft casual, 1 league, checks Sundays only, vibes-based
- First-timer, just joined a friend's league, overwhelmed
- Trade junkie, lives in the trade finder, ignores stats
- Data nerd, builds custom formulas, never uses pre-built panels
- Lurker, browses but never connects Sleeper

**Simulation:** Each persona gets a Sonnet controller that sees Playwright screenshots of the actual rendered site and makes navigation decisions as that persona would. 20 archetypes x 50 sessions = 1,000 journeys per cycle.

**Instrumentation captures:**
- Agent callout impressions, clicks, dismissals
- Hover duration on margin notes
- Full navigation path
- Time-on-page per section
- Conversion events (free → pro → elite)
- Churn events (when they stop returning)
- Feature discovery order
- Last agent touch before every conversion and every churn

### Loop 2: Agent Self-Reflection

Each agent independently analyzes their own engagement data after every simulation batch.

**Each agent reads their own metrics and writes:**
- `self-improvement/{agent}-insights.md` — what they learned
- `self-improvement/{agent}-placement.json` — updated placement config
- `self-improvement/{agent}-copy-variants.json` — copy with performance scores
- `self-improvement/{agent}-timing.json` — session/page timing rules

**Agents control these levers in their domain:**

| Lever | Description |
|-------|-------------|
| Placement | Which pages, panels, columns to appear on |
| Copy variants | Multiple versions of margin notes, loading states, tooltips |
| Timing | When in a session to show up |
| Frequency | How often per session/page |
| Targeting | Different behavior per user persona |
| Stitching | Cross-product nudges they create |
| Creation | Propose entirely new placements |
| Deletion | Remove placements that underperform |
| Escalation | Flag conflicts to Razzle's strategy pass |

### Loop 3: Cross-Agent Strategy Session (Razzle — Opus)

After all agents self-reflect, Razzle reads all 6 insight files and optimizes cross-agent behavior:

- Identifies natural stitching opportunities (Dolphin injury flag → Hawkeye replacement panel)
- Optimizes conversion funnel sequences
- Resolves territory conflicts (two agents want the same slot)
- Adjusts cross-product nudge targets based on what paths convert
- Writes: `self-improvement/razzle-strategy.md` and `self-improvement/cross-agent-stitching.json`

### Loop 4: Peer Review

Each agent reviews one other agent's changes before deployment:
- Catches brand drift, spam creep, territory cannibalization
- Veto power: flag disagreements to Razzle for arbitration
- Rotation: Dolphin reviews Hawkeye, Hawkeye reviews Bones, Bones reviews Octo, Octo reviews Atlas, Atlas reviews Dolphin, Razzle reviews all.

### The Full Cycle

```
1. SIMULATE — Playwright + Sonnet personas, 1000 journeys (only Sonnet usage)
       ↓
2. SELF-REFLECT — each agent analyzes own data (Opus)
       ↓
3. STRATEGY SESSION — Razzle synthesizes cross-agent (Opus)
       ↓
4. PEER REVIEW — agents review each other's changes (Opus)
       ↓
5. DEPLOY CONFIG — updated JSONs committed, frontend reads on next build
       ↓
6. RE-SIMULATE — same journeys, new config, measure lift
       ↓
   Loop back to 1
```

### Configuration Schema

Each agent's learned behavior is structured JSON read by the frontend at runtime:

```json
{
  "agent": "dr_dolphin",
  "version": 47,
  "placements": [
    {
      "id": "dolphin-lab-injury-col",
      "location": "lab.screener.column.injury_status",
      "type": "icon",
      "tier": "free",
      "enabled": true,
      "performance": { "ctr": 0.47, "sessions": 2340 }
    },
    {
      "id": "dolphin-lab-aging-note",
      "location": "lab.panel.aging_curves.margin",
      "type": "margin_note",
      "tier": "pro",
      "enabled": false,
      "disabled_reason": "0.03 CTR over 500 sessions — killed by self-reflection loop 12"
    }
  ],
  "copy_variants": {
    "durability_v1": { "text": "injury risk: elevated", "ctr": 0.12 },
    "durability_v2": { "text": "missed 3 of last 5 — durability flag", "ctr": 0.28 },
    "durability_v3": { "text": "hamstring history — Dr. Dolphin says caution", "ctr": 0.31 }
  },
  "timing_rules": {
    "new_user_delay_seconds": 45,
    "returning_user_delay_seconds": 0,
    "max_per_session": 2,
    "max_per_page": 1
  },
  "persona_overrides": {
    "dynasty_veteran": { "copy_style": "terse", "show_data": true },
    "casual_redraft": { "copy_style": "friendly", "show_data": false },
    "first_timer": { "enabled": false, "reason": "wait until session 3" }
  }
}
```

### Optimization Log

Every cycle logs to `self-improvement/optimization-log.tsv`:

```
cycle | version | total_ctr | conversion_rate | avg_session_depth | churn_rate | best_agent | worst_agent | new_placements | killed_placements | notes
```

### Post-Launch Transition

Once real users arrive, synthetic data becomes hypothesis testing:
- Pre-500 users: synthetic simulation is primary signal, real data supplements
- 500+ users: real data is primary, synthetic tests proposed changes before deployment
- Agents propose a change → test in simulation → deploy to real users if lift confirmed

### Guard Rails

- **Human veto dashboard.** Every config change visible before deployment. One-click approve/reject.
- **Brand lock.** Agent personalities are immutable. Loop optimizes where/when/how, not who-they-are.
- **Revert on regression.** If cycle metrics drop, auto-revert to last known good config.
- **Spam ceiling (hard-coded).** Max 1 nudge per page, max 3 per session (free/pro), max 5 (elite). Non-negotiable.
- **Territory respect.** Agents can only create placements in their own domain. Razzle arbitrates borders.

---

## MiroFish Season Simulation (User-Facing Feature)

### Overview

MiroFish powers a user-facing feature: narrative season simulation. Instead of Monte Carlo's pure math (which Octo already runs), MiroFish simulates social systems — 12 managers making decisions, reacting to events, trading, panicking, getting lucky. Users explore alternate futures of their actual league.

### Tier Split

**Pro: Decision Sandbox**
- User considers a specific move (trade, waiver, start/sit)
- MiroFish simulates 50 futures branching from that decision
- Visual branching timeline: "If you make this trade, here are 10 ways it plays out. If you don't, here are 10 others."
- Focused, one-decision scope

**Elite: Season Simulator**
- Seed MiroFish with the actual league: real rosters, real manager behavioral profiles (Atlas provides), real scoring settings
- Simulate 100+ remaining-season timelines
- Explore alternate realities: trades that happen, injuries that hit, breakouts that fire, collapses that unfold
- Full-season scope

### How Agents Feed the Simulation

| Agent | Simulation Input |
|-------|-----------------|
| **Atlas** | Manager behavioral profiles — who panics, who holds, who trades at 2am, historical patterns |
| **Dr. Dolphin** | Injury probability curves — creates realistic health events across simulated weeks |
| **Hawkeye** | Breakout/bust probabilities — seeds usage trend shifts based on real data |
| **Octo** | Math validation — ensures simulated outcomes are statistically plausible |
| **Bones** | Trade behavior modeling — which managers deal with whom, what triggers trades |
| **Razzle** | Narration — annotates key timeline nodes with the verdict |

### UI: Visual Branching Timeline

- Branching tree / swimlane view — each branch is a timeline
- Key events are nodes: trades, injuries, breakouts, playoff outcomes
- Click any node to expand — see the agent annotation explaining what happened and why
- Color-coded by outcome: green (championship path), yellow (playoff), red (collapse)
- Agent avatars appear on nodes in their domain (Dolphin on injuries, Bones on trades)

### Technical Integration

- MiroFish backend runs as a service alongside the existing FastAPI server
- League data piped from Sleeper adapter + Bureau behavioral profiles
- Simulation results cached per league per week (expensive to run, cache aggressively)
- Frontend renders timeline using canvas or SVG branching visualization

---

## The User Journey — Earned Discovery

### Week 1: Free User from Reddit

Clicks a screenshot on r/DynastyFF. Lands on the Lab.
- Loading: "pulling film..." — doesn't know that's Razzle
- Tiny eagle icon next to target share column — doesn't notice
- Margin note on breakout panel: "3 names here weren't on this list 2 weeks ago" — that's Hawkeye, they don't know
- Exports a screenshot with razzle.lol watermark
- **Feeling:** This site has personality. Something is alive in here.

### Week 3: Returning, Connects Sleeper

- Bureau loads. Top card: "Your league at a glance." — Razzle's summary, unnamed
- Roster depth: health badges with tiny dolphin icon. Hover reveals "Dr. Dolphin — Medical Analyst." First name encounter.
- Trade finder subtitle: "Bones — Diplomat." Wait, who's Bones?
- Sees locked Situation Room — pixel agents walking around
- **Feeling:** There's a team in here. These are the ones behind the data.

### Week 5: Pro Trial

- Lab sidebar: agent-attributed panel groups
- Pill nudges: "Hawkeye: 2 bench players trending into starter territory"
- Agent-voiced panel headers become familiar
- **Feeling:** Learning the band through useful contact, not a tutorial.

### Week 7: Elite Upgrade

- Situation Room unlocks — same characters from all those margin notes
- Types a scenario — six agents respond with personalized league context
- Razzle speaks last with the verdict
- Season Simulator: watches 100 futures of their league unfold
- **Feeling:** I'm not paying for AI. I'm paying for my team. They know my league.

---

## File Structure

```
self-improvement/
├── dolphin-insights.md
├── dolphin-placement.json
├── dolphin-copy-variants.json
├── dolphin-timing.json
├── hawkeye-insights.md
├── hawkeye-placement.json
├── hawkeye-copy-variants.json
├── hawkeye-timing.json
├── bones-insights.md
├── bones-placement.json
├── bones-copy-variants.json
├── bones-timing.json
├── octo-insights.md
├── octo-placement.json
├── octo-copy-variants.json
├── octo-timing.json
├── atlas-insights.md
├── atlas-placement.json
├── atlas-copy-variants.json
├── atlas-timing.json
├── razzle-insights.md
├── razzle-strategy.md
├── cross-agent-stitching.json
├── optimization-log.tsv
└── personas/
    ├── dynasty-veteran.json
    ├── redraft-casual.json
    ├── first-timer.json
    ├── trade-junkie.json
    ├── data-nerd.json
    ├── lurker.json
    └── ... (20+ archetypes)
```

---

## Decision Framework Alignment

1. **Does this help us get to 1,000 paid users?** Yes — agents as connective tissue creates the "oh, there's a team in here" moment that converts.
2. **Does this help the Screener get screenshotted?** Yes — agent margin notes add personality to screenshots.
3. **Does this make the Bureau indispensable?** Yes — agents stitch Lab insights to Bureau actions.
4. **Does this follow the design guide?** Yes — Caveat font notes, subtle icons, chunky sticker energy.
5. **Is this the simplest version that works?** Layer 1 (personality) is simple. Layers 2-3 add complexity only for paying users.
6. **Would a r/DynastyFF power user care?** Yes — the earned discovery of the agent team is exactly what power users love.
