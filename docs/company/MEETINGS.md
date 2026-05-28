# Razzle Meetings

Meetings exist to move work between roles. They are not chat rooms. Every meeting
has an owner, attendees, required inputs, and a written output.

**Default is no meeting.** Meetings are an exception, not a cadence. Async PR-style
markdown handoffs are preferred when the work allows.

---

## Meeting Cadence

| Meeting | Cadence | Owner | Output |
|---------|---------|-------|--------|
| Daily Build Standup | Every build day (async) | Chief of Staff | One vertical slice, three-equals vote, handoff |
| Outside Reality Briefing | Weekly until launch is real | Data Researcher | Feature gaps, user language, build-queue inputs |
| Build Review | After every shipped slice | Reality Checker | PASS / NEEDS WORK / BLOCKED with execution evidence |
| Founder Board | Trigger-based (see triggers below) | Chief of Staff | Priority changes, role scorecards, KEEP/DELETE/REFINE election |
| Hiring/Firing Review | Trigger-based (see triggers below) | Chief of Staff | Keep, rewrite, merge, downgrade, or fire roles |

---

## Daily Build Standup

**Format:** Async. The output is a markdown file committed at
`docs/company/standups/YYYY-MM-DD.md`. There is no live meeting.

**Purpose:** Pick exactly one vertical slice, vote three-equals, and define the handoff.

**Voices:** Chief of Staff (router), Product Strategist, Engineering Architect, Builder.

**Inputs:**

- `docs/NORTH_STAR.md`
- `docs/v2/STATUS.md`
- `docs/v2/PARITY.md`
- `docs/v2/DEPTH.md`
- `docs/v2/ACCEPTANCE.md`
- Recent `docs/v2/results.tsv`
- `docs/company/memory/<role>.md` for each voice
- Last 3 standup files in `docs/company/standups/`

**Sequence:**

1. Chief of Staff states current status, last cycle outcome, and constraints.
2. Product Strategist proposes one slice. Must cite a PARITY row, DEPTH layer,
   or ACCEPTANCE check. Otherwise the slice is `KILL`.
3. Engineering Architect votes SHIP / VETO / DEFER. Defines boundary, risks, tests.
4. Builder votes SHIP / VETO / DEFER. Confirms scope is implementable.
5. Three-equals rule: **2/3 SHIP → build immediately.** A single VETO on North Star,
   ACCEPTANCE, or Karpathy simplicity blocks until resolved in the same standup file.
6. Chief of Staff writes the final handoff or `KILL` note.

**Output (committed as `docs/company/standups/YYYY-MM-DD.md`):**

```markdown
## Daily Build Standup — YYYY-MM-DD

- Slice:
- PARITY row / DEPTH layer / ACCEPTANCE check:
- Why this matters (cycle scorecard):
- Owner:
- Files likely touched:
- Tests / evidence required:
- Not this cycle:

### Votes

- Product Strategist: SHIP | VETO | DEFER | KILL — reason
- Engineering Architect: SHIP | VETO | DEFER — reason
- Builder: SHIP | VETO | DEFER — reason
- Verdict: SHIP | VETO | DEFER | KILL

### Handoff
```

A `KILL` slice produces a standup file too — the company learns from rejected ideas.

---

## Outside Reality Briefing

**Purpose:** Feed the build queue with feature gaps, user language, and capability
requests harvested from outside the company.

**Not the purpose:** Posting, drafting marketing copy, channel strategy, launch
positioning. Those activate when the company advances to the launch-readiness stage.

**Cadence:** Weekly until launch readiness. Cap at one briefing per week.

**Attendees:** Data Researcher, Product Strategist, Chief of Staff.

**Inputs:**

- `docs/v2/REDDIT.md`
- `docs/v2/REDDIT-INTEL.md`
- `docs/v2/PARITY.md` (to know what gaps already exist in backlog)
- Fresh observations from r/DynastyFF, r/fantasyfootball, r/fantasyfootballadvice
- Competitor pages and public docs
- `docs/company/memory/data-researcher.md`

**Agenda:**

1. Data Researcher reports concrete observations with thread URLs and exact quotes.
2. Product Strategist maps observations to PARITY rows, DEPTH layer climbs, or
   new feature candidates.
3. Chief of Staff decides whether any build priority changes for the next cycles.

**Output:**

```markdown
## Outside Reality Briefing — YYYY-MM-DD

- Subreddits / sources observed (URLs):
- Repeated user phrases (exact quotes):
- Pain signals / capability requests:
- Feature-gap candidates → PARITY row or DEPTH layer:
- Build priority changes (if any):
- Confidence: high / medium / low
```

---

## Build Review

**Purpose:** Decide whether work is real enough to ship or needs another loop.

**Attendees:** Reality Checker (owner), Engineering Architect, Builder, Chief of Staff.

**Inputs:**

- Diff
- Test output
- Screenshot, browser evidence, or curl output (mandatory for PASS)
- API/curl evidence when backend changed
- Acceptance criteria from the slice (PARITY row / DEPTH layer / ACCEPTANCE check)
- `docs/v2/ACCEPTANCE.md`

**Agenda:**

1. Builder summarizes what changed and what was not changed.
2. Engineering Architect checks architecture and test coverage.
3. Reality Checker tries to disprove completion. **PASS requires execution evidence:**
   curl output, screenshot, or executed test result. Diff-only review is never PASS.
4. Reality Checker verifies the layer/PARITY claim. If the slice claimed L3 advancement,
   the L3 criteria from `DEPTH.md` must be verifiable.
5. Reality Checker verifies `git status --porcelain` is clean and `results.tsv` has a
   real 7-char commit hash.
6. Chief of Staff logs verdict and next action.

**Output:**

```markdown
## Build Review — YYYY-MM-DD

- Slice:
- PARITY/DEPTH/ACCEPTANCE claim:
- Evidence (curl / screenshot / test output):
- Layer verification: PASS | FAIL — reason
- Issues found:
- Ship verdict: PASS | NEEDS WORK | BLOCKED
- Required fixes:
- Follow-up debt:
- Commit hash: <7-char>
- `git status --porcelain`: clean | dirty
```

---

## Founder Board

**Purpose:** Course-correct the company when an automated cycle cannot resolve
something. Trigger-based, not calendar-based.

**Triggers (any one):**

- A slice failed Build Review twice in a row.
- Product Strategist and Engineering Architect issue mutual VETOs that did not resolve.
- Outside Reality Briefing reports market signal that contradicts the build plan.
- Founder requests it.
- Stage advancement is being considered (see `STAGE.md`).
- Every 10 cycles minimum even if no other trigger fired (board catch-up rule).

**Attendees:** Founder, Chief of Staff, Product Strategist, Engineering Architect,
Data Researcher, Reality Checker.

**Inputs:**

- North Star
- `docs/v2/STATUS.md`, `PARITY.md`, `DEPTH.md`, `FEATURES.md`
- `docs/v2/results.tsv`
- Last 3 standups
- Role scorecards (`docs/company/memory/role-scorecards.tsv` if present)

**Agenda (KEEP / DELETE / REFINE format on triggered cycles):**

1. Chief of Staff summarizes company state.
2. Product Strategist argues what matters most now.
3. Data Researcher reports outside reality.
4. Engineering Architect reports execution constraints and code health.
5. Reality Checker names uncomfortable truths.
6. Each role tags recent slices: `KEEP` (compounding), `DELETE` (half-done, prune),
   or `REFINE` (worth saving with surgical work).
7. **3/4 APPROVE → DELETE executes** (Founder owns the 4th vote).
8. Founder decides scope, priorities, role changes.

**Output:**

```markdown
## Founder Board — YYYY-MM-DD (cycle N)

- Trigger:
- Decision:
- Why:
- Evidence:
- KEEP rows:
- DELETE rows (3/4 approval, executed by Builder this session):
- REFINE rows (queued for next cycles):
- Roles to adjust:
- Work to stop:
- Next 1-3 priorities:
- Commit hash:
```

---

## Hiring/Firing Review

**Purpose:** Improve the org itself. Trigger-based.

**Triggers (any one):**

- A role's scorecard average drops below 3.0 over its last 3 runs.
- A role produced 3 artifacts in a row that the Founder rewrote >30%.
- A role repeatedly missed bugs Reality Checker caught.
- A role's model spend is materially out of line with its impact.
- Founder requests it.

**Attendees:** Founder, Chief of Staff, Reality Checker. Relevant role joins if under review.

**Inputs:**

- Role scorecard (`docs/company/memory/role-scorecards.tsv`)
- Last three outputs from the role
- Cost / model usage
- Evidence of impact or lack of impact
- The role's own `docs/company/memory/<role>.md`

**Agenda:**

1. Chief of Staff states role mandate and recent outputs.
2. Reality Checker evaluates evidence quality.
3. Founder decides one of: keep, rewrite, swap model, narrow, merge, fire.
4. Chief of Staff updates the role contract and `role-scorecards.tsv`.

**Output:**

```markdown
## Hiring/Firing Review — YYYY-MM-DD

- Role:
- Trigger:
- Verdict: keep | rewrite | downgrade | escalate | merge | fire
- Reason:
- Prompt/model change:
- Next review trigger:
```

---

## Commit Gate (applies to every meeting)

Carried over from the prior `v2_loop` ethos and now canonical:

- Every cycle ends with `git commit` + `git push`.
- `keep` requires a real 7-char commit hash in `results.tsv`. `none` is invalid.
- `discard` and `crash` outcomes still commit (the revert or a docs-only failure log).
- Reality Checker (or Founder) verifies `git status --porcelain` is clean before
  the next cycle starts.

Uncommitted code is decay. Unpushed code is decay.
