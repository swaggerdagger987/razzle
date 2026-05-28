# Company Automation

This document defines how Razzle turns roles into a recursive company loop.

The goal is not to create a swarm. The goal is to create a reliable sequence of
judgment, execution, verification, memory, and replacement.

---

## Automation Maturity

### Stage 0: Manual role invocation

Use the role files directly. The Founder or Chief of Staff prompts one role at a
time. Output committed to `docs/company/standups/` and per-role memory files.

**Stage 0 → 1 unlocks when:** 5 daily standups in a row produce artifacts the
Founder used unchanged (>= 70% acceptance, no rewrites needed).

### Stage 1: Handoff chain

Chief of Staff runs a fixed sequence:

1. Product Strategist proposes one slice.
2. Three-equals vote (Strategist / Architect / Builder) → 2/3 SHIP or KILL.
3. Builder implements it.
4. Reality Checker verifies it (execution evidence required).
5. Chief of Staff logs results and updates memory.

**Stage 1 → 2 unlocks when:** Outside Reality Briefing has produced 3 feature-gap
items that became real PARITY rows in the build queue, AND the Stage 1 chain has
run reliably for 10 cycles.

### Stage 2: Parallel research + build

Run build and outside-reality learning in parallel:

- Build chain: Strategist → Architect → Builder → Reality Checker
- Research chain: Data Researcher → Strategist → Chief of Staff → build queue

**Stage 2 → 3 unlocks when:** the Founder is genuinely no longer reading every
standup and the loop has produced compounding memory entries (i.e., later cycles
reference and re-use earlier learnings without prompting).

### Stage 3: Recursive company loop

Roles maintain memory, scorecards, and hiring/firing decisions automatically. The
Chief of Staff periodically asks whether the org itself should change.

Stage 3 is **not in scope yet.** Do not target it. Focus on Stage 0 → 1 → 2.

---

## Standard Company Loop

```text
North Star + STAGE.md
  -> Chief of Staff agenda (read memory + last 3 standups + results.tsv)
  -> Product Strategist slice proposal (PARITY/DEPTH/ACCEPTANCE-cited or KILL)
  -> Three-equals vote (Strategist / Architect / Builder)
  -> Builder execution (Karpathy: surgical, simple, goal-driven)
  -> Reality Checker verification (execution evidence required)
  -> Builder commit + push (real 7-char hash to results.tsv)
  -> Chief of Staff memory + scorecard update
  -> Founder Board only if triggered
```

Every loop ends with:

- Artifact produced
- Evidence attached (curl, screenshot, or test run)
- Role performance scored (3-line daily scorecard)
- Memory written
- Commit hash recorded
- Next handoff clear

---

## Prompt Template

Use this when invoking a role manually:

```text
You are the Razzle <ROLE>.

Read in order:
1. docs/NORTH_STAR.md
2. docs/DESIGN.md
3. docs/DECISIONS.md
4. docs/v2/STATUS.md
5. docs/v2/PARITY.md
6. docs/v2/DEPTH.md
7. docs/v2/ACCEPTANCE.md
8. docs/company/STAGE.md
9. docs/company/OPERATING_SYSTEM.md
10. docs/company/roles/<role>.md
11. docs/company/memory/<role>.md
12. docs/v2/results.tsv (last 20 rows)
13. docs/company/standups/ (last 3 files)

Task:
<specific task>

Constraints:
- Follow your role mandate. Do not exceed it.
- Produce your required artifact.
- Use evidence, not vibes. Cite PARITY rows, DEPTH layers, ACCEPTANCE checks.
- State what is not in scope.
- Karpathy: simplicity first, surgical changes, goal-driven verification.
- End with: SHIP | VETO | DEFER | KILL | KEEP | REVISE | ESCALATE | BLOCKED
  (use the verdict that matches your role).
- Append a memory entry to docs/company/memory/<role>.md.
```

---

## Model Routing

| Task | Default | Escalate when |
|------|---------|---------------|
| Coordination (Chief of Staff) | `gpt-5.5-medium` | Founder Board, role conflict |
| Product strategy (routine slice pick) | `claude-4.6-sonnet-medium-thinking` | Scope kill, pricing, channel, ambiguous tradeoffs |
| Product strategy (high-stakes) | `claude-opus-4-7-thinking-xhigh` | Already escalated |
| Architecture | `gpt-5.3-codex` | Product tradeoff dominates → Opus |
| Implementation | `composer-2.5-fast` | Failed once or touches critical code → Codex |
| Research synthesis | `claude-4.6-sonnet-medium-thinking` | Launch narrative or pricing implication → Opus |
| Research bulk extraction | `composer-2.5-fast` | Pattern is fuzzy → Sonnet |
| Review | `gpt-5.3-codex` | Brand/voice claim → Opus |

Escalation is not failure. It is model-market fit.

The Founder owns the cost ceiling and can downgrade defaults at any time.

---

## Memory Design

Memory files exist from day 1:

```text
docs/company/memory/
  chief-of-staff.md
  product-strategist.md
  engineering-architect.md
  builder.md
  data-researcher.md
  reality-checker.md
  decisions.tsv         (added on first non-trivial company decision)
  role-scorecards.tsv   (added on first scorecard log)
```

Every role's autoresearch loop step 7 ("write memory") appends to its own file.
Format: `YYYY-MM-DD | hypothesis | outcome | keep / discard / revisit | evidence`.

Memory entries should be short and queryable. A good memory entry changes future
behavior. A bad memory entry is a diary.

Memory automation (auto-summarization, search, indexing) is deferred until manual
entries prove load-bearing.

---

## Verdicts

Every role run ends with one of:

| Verdict | Meaning | Used by |
|---------|---------|---------|
| SHIP | Slice should be built | Three-equals vote |
| VETO | Slice violates North Star, ACCEPTANCE, or Karpathy simplicity | Three-equals vote |
| DEFER | Slice is fine but a different one is higher-leverage now | Three-equals vote |
| KILL | Slice does not map to PARITY/DEPTH/ACCEPTANCE — kill the cycle premise | Strategist only |
| KEEP | Output is useful and can feed the next role | Build / review |
| REVISE | Same role should fix the artifact | Build / review |
| ESCALATE | Stronger model or different role needed | Any role |
| BLOCKED | Missing input, access, or decision | Any role |
| PASS | Reality Checker accepts ship readiness with execution evidence | Reality Checker only |
| NEEDS WORK | Reality Checker rejects pending fixes | Reality Checker only |

The Chief of Staff decides the next step.

---

## Firing Automation

After every three role runs, Chief of Staff (or Founder) reviews:

1. 3-line daily scorecard average
2. Cost fit (Founder judgment)
3. Evidence quality
4. Whether another role rewrote most of the output
5. Whether the output changed company behavior
6. Memory quality (does memory change future runs?)

Recommended actions:

- Keep if score is high and output is used.
- Rewrite if useful but vague.
- Downgrade if useful but over-modeled.
- Escalate if cheap model repeatedly fails on important work.
- Merge if another role owns the real decision.
- Fire if output does not affect decisions.

See `HIRING_AND_FIRING.md` for the full procedure.

---

## Never Automate

These actions never become automatic, even at Stage 3:

1. **Posting to Reddit, Twitter, Discord, or any public channel** under the
   Founder's identity. Drafts only; the Founder posts.
2. **Stripe charges, refunds, or pricing changes.** Even at launch.
3. **Auto-merging RED → GREEN in `PARITY.md`** without a Reality Checker PASS
   that includes execution evidence.
4. **Auto-promoting a DEPTH layer (e.g., L1 → L3)** without a verifiable demo
   meeting the layer's `DEPTH.md` criteria.
5. **Creating a new role.** Founder only.
6. **Modifying `NORTH_STAR.md`, `DESIGN.md`, or `DECISIONS.md`.** Founder only;
   role recommendations land in PR or memo form.
7. **`git push` with secrets** (`.env`, credentials). Commit gate excludes these.
8. **Killing the Reality Checker's verdict.** Builder cannot self-approve. Three-
   equals does not override Reality Checker; Founder does.
9. **Skipping the commit gate.** Even on `discard` or `crash`, the cycle commits.
10. **Storing private user data** outside the systems explicitly designed for it.

---

## First Script To Build Later

When ready, add:

```bash
scripts/company_loop.sh --daily          # run one cycle of the standard loop
scripts/company_loop.sh --reality-brief  # run Outside Reality Briefing
scripts/company_loop.sh --founder-board  # run a triggered Founder Board
scripts/company_loop.sh --role-review    # run a triggered Hiring/Firing Review
```

**Pre-script gates** (do not build until all are met):

1. Stage 0 → 1 unlock conditions met (5 standups with >=70% Founder acceptance).
2. Memory files exist for all 6 roles and contain real entries from manual runs.
3. Three manual standups produced standup files Founder used without rewriting.
4. The prior cofounder loop has been retired into
   `graveyard/v2-cofounder-loop/` with `RETIRED.md` pointing to `docs/company/`.

The script is a thin shell over the manual loop. It does not invent new agents,
new meetings, or new memory schemas. It runs the same prompts a human would.
