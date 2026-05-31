# Role Scorecards

Scorecards keep the company honest. They decide whether a role is compounding or
just producing confident text.

The company is in **deep build, no-launch, no-users** stage. Daily scorecards must
be cheap to maintain and tied to internal build progress, not external metrics.
Full evaluation runs only at trigger-based Hiring/Firing Review.

---

## Daily Scorecard (3 lines)

Use this every run. Anything more than 3 questions per run will be abandoned within
a week.

| # | Question | Answer |
|---|----------|--------|
| 1 | Did this run advance a PARITY row, DEPTH layer, or ACCEPTANCE check? | yes / no / which row |
| 2 | Did the Founder use the artifact unchanged? | yes / edited X% / rejected |
| 3 | Did this run write reusable memory? | yes / no |

A run with all three `yes` is what compounds. A run with two `no` answers should
trigger a Hiring/Firing Review for that role.

Daily entries append to `docs/company/memory/role-scorecards.tsv` (created on first use).

---

## Monthly / Triggered Full Scorecard

Run only at Hiring/Firing Review or Founder Board. Use 1-5 for each dimension.

| Score | Meaning |
|-------|---------|
| 5 | Changed a decision or caught something important with strong evidence |
| 4 | Useful, specific, and reusable |
| 3 | Some value, but needed cleanup or stronger evidence |
| 2 | Mostly generic, incomplete, or mis-scoped |
| 1 | Harmful, misleading, or ignored the role mandate |

| Dimension | What to ask |
|-----------|-------------|
| Build progress | Did it advance PARITY/DEPTH/ACCEPTANCE? |
| Evidence quality | Did it cite tests, screenshots, code, or research with citations? |
| Leverage | Did it reduce founder load or improve another role's work? |
| Taste | Did it match Razzle's brand, product hierarchy, and restraint? |
| Simplicity | Did it choose the simplest complete version (Karpathy)? |
| Memory | Did it preserve learning for future runs? |
| Cost fit | Was the model choice justified by task stakes? |

---

## Role-Specific Signals

### Chief of Staff

- Standups have clear three-equals votes and final handoff.
- Role handoffs are unblocked.
- Status docs stay current.
- Work does not drift from the active slice.
- Memory entries change future coordination.

### Product Strategist

- Picks painful, narrow, high-leverage slices that map to PARITY/DEPTH/FEATURES.
- Connects features to long-arc paid conversion or distribution, even pre-launch.
- Says no to attractive distractions; produces `KILL` verdicts on bad slices.
- Uses actual user language harvested by Data Researcher.
- Preserves the product hierarchy (Screener → Bureau → Situation Room).

### Engineering Architect

- Keeps code boundaries clear; legacy stays inside `legacy_bridge.py`.
- Prevents god files and duplicate registries.
- Names test strategy and ACCEPTANCE check before implementation.
- Reduces technical debt instead of hiding it.
- Karpathy-aligned: surgical changes, no speculative abstractions.

### Builder

- Ships scoped work quickly.
- Avoids broad refactors.
- Follows existing patterns.
- Leaves evidence and does not fake completion.
- Ends every cycle with commit + push and a real hash in `results.tsv`.
- Surfaces simpler approaches (deletion is a valid SHIP).

### Data Researcher

- Brings fresh observations with thread URLs and exact quotes.
- Distinguishes signal from anecdotes.
- Translates research into PARITY rows or DEPTH layer climbs (build queue input).
- Stays out of posting / drafting / channel work until launch readiness.

### Reality Checker

- Finds real issues before users would (when users exist).
- PASS verdicts always include execution evidence: curl, screenshot, or test run.
- Verifies layer/PARITY claims, not just diff hygiene.
- Verifies `git status --porcelain` clean and commit hash logged.
- Distinguishes launch blockers from follow-up debt.

---

## Scorecard Log Format

Daily 3-line entries (TSV):

```tsv
date	role	task	model	advanced	founder_used	wrote_memory	notes
2026-05-27	builder	docs cleanup	composer-2.5-fast	docs-only	yes	yes	Shipped scoped docs without risky deletion
```

Monthly / triggered full grid (TSV):

```tsv
date	role	task	model	build	evidence	leverage	taste	simplicity	memory	cost_fit	verdict	notes
2026-05-27	builder	docs cleanup	composer-2.5-fast	4	4	4	4	5	3	5	keep	-
```

Both append to `docs/company/memory/role-scorecards.tsv`.

---

## Verdicts

| Verdict | Meaning |
|---------|---------|
| Keep | Role is earning its seat |
| Rewrite | Mandate or prompt is unclear |
| Downgrade | Role is useful but model is too expensive |
| Escalate | Role needs a stronger model for this task type |
| Merge | Role overlaps too much with another |
| Fire | Role produces low-value or dangerous output |

The goal is not to punish roles. The goal is to make the company sharper every
review cycle.
