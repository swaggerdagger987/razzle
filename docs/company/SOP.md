# Razzle Company SOP

This is the operating procedure for becoming a CEO-operated, Slack-driven build
company.

The Founder should eventually spend most of the day on higher-leverage company
work, then review Razzle's product work once at night. The Company OS exists to
make that possible without losing taste, context, or accountability.

---

## CEO Mode Target

The desired steady state:

1. Founder starts the day from Slack: `good morning team`.
2. The team works through one or more vertical product slices.
3. Each role leaves artifacts, evidence, and memory in the repo.
4. Founder can ask any role a question from Slack during the day.
5. The team merges work that passes gates. Founder reviews one evening digest
   and only intervenes on exceptions, disagreements, or taste calls.
6. The repo, not chat history, preserves the company's memory.

Cursor IDE becomes the review room, not the work room.

---

## Fixed Constants

These came from the old cofounder loop and remain correct:

| Constant | Meaning |
|----------|---------|
| Four rooms | Explore (Screener), Lab, League/Bureau, Situation Room |
| Player Sheet | Central junction for stats, panels, league context, and Ask |
| Hallway | Every deep slice must connect rooms; no siloed feature ships |
| Six agents | Product personas stay consistent across rooms |
| Voice | Fantasy-first, never generic "AI" copy |
| One slice | One vertical slice per build cycle |
| Depth | Climb `DEPTH.md`, do not sprawl horizontally |
| Evidence | PASS requires curl, screenshot, or executed test |
| Git | Every cycle produces a real commit, pushed branch, PR, and merge when gates pass |
| Board | Periodic KEEP / DELETE / REFINE review is more important than churn |

If any automation violates these, the automation is wrong.

---

## Workday Model

### Stage A — Autonomous Slack Workday (current)

This is the first live version:

- `good morning team` opens the workday, runs the first Standard Company Loop
  cycle, and starts scheduled tick cycles.
- Role-addressed Slack questions let the Founder talk to specific team members.
- `good evening team` produces a CEO digest by reading the day's open and merged
  PRs, standups, memory updates, and results rows.
- The team may merge its own PRs after all review gates pass.
- Founder reviews at night and decides whether to override, redirect, or let the
  loop keep compounding.

Important: merged commits, PRs, standups, evidence, and memory are the truth.
Slack is a conversational surface, not the system of record.

### Stage B — Continuous Looping

`docs/company/automations/tick.md` is active once configured in Cursor:

- The loop runs additional cycles while the workday is open.
- No artificial daily cycle cap by default.
- Reality Checker, Chief of Staff, or Founder can pause if the loop is producing
  low-quality work, repeated failures, or product drift.
- Founder still reviews at night, but the team does not wait for nighttime to
  merge clean work.

### Stage C — CEO Review Only

The goal:

- Founder starts and stops workdays from Slack.
- Team opens and merges PRs during the day.
- Nightly digest is the only required Founder review.
- Founder enters Cursor only for diff review, merge/reject, or product taste
  calls.

This stage is the operating target. If the team proves the autonomy thesis
wrong, the SOP should record why and narrow the automation instead of pretending.

### Stage D — Lights-out BUILD (target)

See `docs/company/FACTORY-VISION.md`.

- Workday may stay **open indefinitely** (24/7 ticks) until Founder sends
  `good evening team` or a stall rule fires.
- Nightly CEO review is **optional** for BUILD to continue — use the brake when
  costs spike, product needs human touch, or models drift off guardrails.
- Slack: [SLACK-FORMATS.md](./SLACK-FORMATS.md) T1 (10–15 words) per routine ship;
  full roll call in standup/PR only.
- Epic queue: `docs/company/state/current-epic.json` advances atom-by-atom.
- Founder intervenes via `good evening team`, `Board:`, or role prefixes — not
  merge or preview hygiene between atoms.

Permanent human walls unchanged: GTM posting, pricing, NORTH_STAR/DESIGN/DECISIONS
edits ([AUTOMATION.md](./AUTOMATION.md) Never Automate).

---

## Role Conversation From Slack

The team should be addressable by name in Slack:

| Slack prefix | Role |
|--------------|------|
| `Razzle:` or `Chief:` | Chief of Staff |
| `Strategist:` | Product Strategist |
| `Architect:` | Engineering Architect |
| `Builder:` | Builder |
| `Researcher:` | Data Researcher |
| `Reality:` | Reality Checker |
| `Team:` | All six roles respond in sequence |
| `Board:` | Founder Board-style KEEP / DELETE / REFINE review |

The response may be conversational in Slack, but it must preserve durable memory
when the answer changes future behavior:

- standup file
- role memory file
- `docs/v2/results.tsv`
- PR comment/body
- `docs/company/memory/decisions.tsv` (when created)

Slack is the mouth. Markdown is the memory.

### Personality Standard

The team should feel like Razzle:

- sharp on fantasy football
- playful without being unserious
- direct, not corporate
- allergic to generic "AI assistant" language
- willing to call out bad ideas by name
- excited by the joy of a finished product

Each role should get more useful and more distinct over time. Memory should make
them sharper; Slack should make them more alive.

---

## Daily CEO Review

At night, the digest should answer:

1. What shipped today?
2. What did not ship, and why?
3. Which PRs merged autonomously?
4. Which role was strongest?
5. Which role needs correction?
6. What did Reality Checker block?
7. What should the team try first tomorrow?
8. Did this move Explore, Lab, League/Bureau, Room, Player Sheet, or Hallway
   depth forward?

If the digest cannot answer those, the team did not create enough evidence.

---

## Required Review Gates

Every product-changing PR must include:

| Gate | Requirement |
|------|-------------|
| Product | PARITY row, DEPTH layer, or ACCEPTANCE check cited |
| Hallway | Player Sheet / context / room connection checked |
| Design | `DESIGN.md` respected; no generic AI copy |
| Engineering | Scoped implementation and test plan |
| Evidence | curl, screenshot, or executed test |
| Reality | Reality Checker PASS / NEEDS WORK / BLOCKED |
| Memory | At least one role memory entry |
| Git | pushed branch, PR URL, and merge status |

### Autonomous Merge Rule

The team may merge its own PR when all are true:

1. Product-changing work cites PARITY, DEPTH, or ACCEPTANCE.
2. Hallway impact is checked, even if the result is "not applicable."
3. Engineering audit finds no blocker.
4. Product/brand audit finds no blocker.
5. Reality Checker gives PASS with execution evidence.
6. No secrets, prod credentials, Stripe operations, public posting, or
   Founder-only docs are touched.
7. The PR is not changing `NORTH_STAR.md`, `DESIGN.md`, `DECISIONS.md`, role
   contracts, pricing, or public launch posture.

If any condition fails: leave the PR open, tag it NEEDS FOUNDER or NEEDS WORK,
and explain the blocker in the nightly review.

Docs-only process PRs may skip product evidence, but must say why.

---

## Obsidian / Notes

An Obsidian plugin is **not** needed yet.

Use plain Markdown first:

- `docs/company/memory/*.md` for role memory
- `docs/company/standups/*.md` for daily work
- `docs/v2/results.tsv` for cycle ledger
- `docs/v2/evidence/` for proof
- `docs/company/SOP.md` for operating procedure

Obsidian becomes useful later if retrieval becomes painful:

- too many memory entries to search manually
- recurring decisions need backlinks
- Founder wants a graph of product pillars, slices, roles, and decisions

Do not add a plugin until Markdown search fails. The repo should remain the
source of truth.

---

## Board Cadence

Founder Board runs:

- every 10 cycles, no skip
- immediately when Chief of Staff believes the company is drifting
- immediately when Reality Checker sees repeated false PASS, hallucinated work,
  or low-impact churn
- whenever the Founder asks with `Board:`

Board format is KEEP / DELETE / REFINE. DELETE requires multi-role approval and
clear evidence.

---

## Multi-Model Standard

Razzle should use model-market fit:

- Product/brand/North Star: Opus-class judgment
- Engineering architecture and Reality checking: Codex/GPT-class adversarial
  code reasoning
- Throughput/build/documentation: Composer-class speed where safe
- Coordination and summaries: medium-cost reasoning

If Cursor Automations cannot instantiate separate models inside one run, the
agent must still write **separate independent audit sections** using those
lenses and flag the limitation in the nightly review. As the platform allows
more routing, split roles into separate model-specific automations without
changing the SOP.
