# Hiring and Firing Roles

Razzle treats roles like company hires: clear job description, clear owner, clear
scorecard, clear review trigger. The difference is replacement is cheap, so there
is no excuse for keeping a vague role.

---

## Hiring Criteria

Create a role only when:

- The work repeats.
- The work affects product quality, speed, revenue, user trust, or company memory.
- The role has a distinct decision right.
- The output can be judged with evidence.
- The role can get better from prior runs (memory file makes sense).

If the work is one-off, use a temporary subagent. If the work is vague, sharpen
the problem before hiring.

**Roles cannot create roles.** Only the Founder creates new roles. Chief of Staff
can recommend; Founder decides.

---

## Job Description Template

Every role contract must include:

```markdown
# Role: <Name>

## Mandate
What this role owns.

## Model
Default model, escalation model, and why.

## Inputs
Docs, files, data, and prior memory the role must read.

## Outputs
Artifacts the role must produce.

## Autoresearch Loop
How the role learns from each run.

## Meetings
Meetings the role attends and what it contributes.

## Scorecard
How to judge performance.

## Firing Triggers
When to rewrite, downgrade, merge, or retire the role.
```

---

## Evidence-of-Impact Trial

A new role keeps its seat after producing **3 artifacts the Founder used unchanged**.
Calendar-based trials reward going through motions; impact-based trials reward
usefulness.

For each artifact, log to `docs/company/memory/role-scorecards.tsv` using the daily
3-line format from `SCORECARDS.md`:

| # | Question | Answer |
|---|----------|--------|
| 1 | Did this run advance a PARITY row, DEPTH layer, or ACCEPTANCE check? | yes / no / which |
| 2 | Did the Founder use the artifact unchanged? | yes / edited X% / rejected |
| 3 | Did this run write reusable memory? | yes / no |

After the role hits 3 unchanged-use artifacts: **keep** with a confirmed contract.

If the role goes 3 runs without an unchanged-use artifact: **trigger a
Hiring/Firing Review.**

Any company-killing hallucination: immediate review, regardless of streak.

---

## Firing Triggers

A Hiring/Firing Review fires automatically when any of:

- Role scorecard average drops below 3.0 across last 3 runs (full grid).
- Role produced 3 artifacts in a row Founder rewrote >30%.
- Role repeatedly missed issues Reality Checker caught.
- Role's model spend is materially out of line with its impact (Founder judgment).
- Founder requests it.

---

## Firing Actions

Use the smallest correction that fixes the failure.

| Failure mode | First action | Second action |
|--------------|--------------|---------------|
| Vague output | Rewrite job description | Narrow role |
| Too expensive | Swap to cheaper model | Escalate only for high-stakes calls |
| Misses bugs | Add Reality Checker review | Replace model |
| Repeats old ideas | Improve memory and results log | Fire role |
| Creates scope creep | Add explicit non-goals | Merge under Chief of Staff |
| Produces no decisions | Change meeting format | Retire role |

---

## Rehiring

A fired role can be rehired only with a new contract:

- New mandate
- New scorecard
- New model rationale
- Specific reason prior version failed
- First three trial tasks

Do not rehire a role with the same prompt and hope it behaves differently.

---

## Model Philosophy

Use model spend where mistakes are expensive.

| Work type | Preferred model | Reason |
|-----------|-----------------|--------|
| Product strategy (routine slice picks) | `claude-4.6-sonnet-medium-thinking` | Good enough for backlog picks |
| Product strategy (scope kill, pricing, channel pivot) | `claude-opus-4-7-thinking-xhigh` | Taste and second-order effects matter |
| Architecture review | `gpt-5.3-codex` | Strong code/system criticism |
| Implementation | `composer-2.5-fast` | Cheap repetition and scaffolding |
| Research (synthesis) | `claude-4.6-sonnet-medium-thinking` | Balance cost and judgment; Opus reserved for launch narrative |
| Research (bulk extraction) | `composer-2.5-fast` | Cheap mechanical work |
| QA / review | `gpt-5.3-codex` | Adversarial detail |
| Routine coordination | `gpt-5.5-medium` | Good enough for ops, only invoke when handoff needs writing |

Cost is a constraint, not the strategy. Never save pennies on decisions that can
cost weeks. Founder controls the cost ceiling directly — there is no automated cap
in build stage.

---

## Founder Rule

The Founder can always say:

- "This role is not earning its seat."
- "Rewrite the job description."
- "Use a cheaper model."
- "Escalate this to the best model."
- "Merge these roles."
- "Stop this meeting."

The Company OS exists to increase founder leverage, not bury the founder in process.
