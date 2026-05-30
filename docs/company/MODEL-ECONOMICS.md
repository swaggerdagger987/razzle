# Model Economics — Sustainable Factory

The factory must ship **and** stay affordable. One Opus run that re-reads the
entire repo, re-debates strategy, and re-implements from scratch is not
sustainable — that is how you get cycle 58 in one day with empty previews.

**Law:** Expensive models **decide and decompose**. Cheap execution **types**.
Reality ** verifies** with curl, not essays.

---

## Two tiers

| Tier | Roles | Job | Model intent | Token budget |
|------|-------|-----|--------------|--------------|
| **Planner** | Chief, Strategist, Architect, Researcher (light) | Find the big problem, pick **one** atomic slice, write the contract | Opus / Sonnet thinking | ≤ 25k input |
| **Executor** | Builder | Implement the contract only | **Composer-class** (fast, surgical) | ≤ 40k input |
| **Verifier** | Reality | Execute checks, FACTORY-DOD | Codex / medium | ≤ 15k input |

**Total per cycle: ≤ 80k input.** Many cycles per open workday (ticks); Founder
brakes with `good evening team` when cost or guardrails require it.

Cursor Automations often run **one model per trigger**. Simulate tiers inside
one run by **strict phase boundaries** (below).

| Trigger | Model | Does |
|---------|-------|------|
| `good morning team` | Opus thinking (plan) + Composer behavior (build) | Open factory + cycle 1 |
| **Loop tick** (routine) | Sonnet behavior (plan) + Composer (build) | Next atom from `current-epic.json` |
| **Loop tick** (new epic) | Opus thinking | New big problem + epic |
| `team build` (future) | **Composer 2.5 Fast** | Read contract → code → merge |
| Ask Team (routine) | Sonnet thinking | Q&A |
| Ask Team (`Board:`) | Opus | Founder-level |
| Evening review | Sonnet thinking | Brake digest |

Until split automations exist, honor phases as if the model changed each tick.

---

## Phase 1 — PLAN (Planner tier)

**Goal:** Answer two questions in writing before any code:

1. **Big problem** — What is the highest-leverage gap for Razzle this week?
   (One sentence. Football-native. Tied to PARITY / DEPTH / ACCEPTANCE / North Star.)
2. **Today's atom** — What is the **smallest shippable slice** that moves that
   problem? One vertical cut. One PR. Merge today.

### Strategist rules

- Do **not** pick a slice because it is easy. Pick because it advances the big problem.
- Decompose: `Big problem → epic (3–5 slices max) → today's atom only`.
- If today's atom was **already merged today** (check `results.tsv` + base branch),
  pick the **next atom** in the epic or a new problem — do not rebuild the same route.
- **KILL** slices that are docs-only churn, prompt thrashing, or horizontal sprawl.

### Architect rules

- Turn the atom into a **slice contract** (see `docs/company/state/current-slice.json`).
- `allowed_paths`: explicit file list (typically 1–3 files).
- `max_lines`: hard cap (default 300; OG routes may be 400 with justification).
- `acceptance_commands`: exact curl/pytest/build commands Reality will run.
- If the atom needs >3 files or >400 lines, **DEFER** — split the epic.

### Researcher rules (light)

- **≤ 5 minutes.** Scan `REDDIT-INTEL.md` + memory only. At most 3 bullets.
- No web scraping unless it changes slice choice.

### Planner read list (only these in Phase 1)

1. `docs/company/MODEL-ECONOMICS.md` (this file)
2. `docs/company/state/workday.json`
3. `docs/company/state/current-epic.json`
4. `docs/company/NEXT.md`
4. `docs/v2/STATUS.md` (skim)
5. `docs/v2/LOOP-STATE.md`
6. Last standup **verdict + slice title only** (do not re-read full history)
7. Last **5** rows of `docs/v2/results.tsv` (not 20)

Do **not** re-read `NORTH_STAR.md`, `DESIGN.md`, or all six role files every
cycle. Reference them; open only when the slice touches voice or trust rules.

**Output:** Write `docs/company/state/current-slice.json` before Phase 2.

---

## Phase 2 — BUILD (Executor tier)

**Behave like Composer** even if the VM model is Opus:

- Read **only** `current-slice.json` + files in `allowed_paths` + `DESIGN.md`
  if UI (skim colors/borders section).
- No architecture essays. No refactors outside `allowed_paths`.
- Smallest diff that clears `acceptance_commands`.
- Stop when contract satisfied — do not gold-plate.

If stuck after one focused attempt: append `blocked_reason` to the standup and
**ESCALATE** to Codex in a follow-up run — do not burn 200k tokens looping.

---

## Phase 3 — VERIFY (Verifier tier)

- Run `acceptance_commands` from the slice contract.
- Run `docs/company/FACTORY-DOD.md` gates.
- PASS only with execution output in standup or `docs/v2/evidence/`.

No product audits longer than 10 bullets. No re-reading the diff for "vibes."

---

## Cost anti-patterns (instant Chief review)

| Pattern | Why it burns money | Fix |
|---------|-------------------|-----|
| Re-read 30+ docs every cycle | Opus tax on static content | Tiered read lists |
| Same slice shipped twice same day | Re-fire without checking base | Check `results.tsv` + merge-base |
| 50+ cycles/day without epic state | Opus re-plan every tick | `current-epic.json` + Sonnet routine pick |
| Disabled ticks with open workday | Factory stops after one atom | Enable tick ~60min; see FACTORY-VISION.md |
| Reality PASS on build only | Rework + Founder debug | FACTORY-DOD Gate C |
| Builder picks slice | Strategist skipped | KILL — contract must exist first |
| 800-line OG route in one atom | Epic not decomposed | Split epic in contract |

---

## Scorecard (nightly)

Chief of Staff / evening review logs:

- `plan_tokens_est`: low / ok / over
- `big_problem_clear`: y/n
- `atoms_shipped`: count today
- `duplicate_slice`: y/n
- `merge_on_base`: y/n
- `guardrail_incidents`: y/n

Founder tunes model choices in the dashboard when `over` repeats.

---

## Slack (CEO format)

Routine merges: **T1** — 10–15 words ([SLACK-FORMATS.md](./SLACK-FORMATS.md)).
Roll call and evidence live in standup/PR only — not Slack.

---

## Dashboard model guidance

| Automation | Recommended model | Why |
|------------|-------------------|-----|
| Morning (plan+build in one) | Opus thinking **only if phases honored**; otherwise split | Planning quality |
| Morning plan-only (future) | Opus thinking | Cheap when no code |
| `team build` (future) | **Composer 2.5 Fast** | Throughput |
| Ask Team (routine) | Sonnet thinking | Q&A |
| Ask Team (`Board:`) | Opus | Founder-level |
| Evening review | Sonnet thinking | Read diffs, digest |

**Sustainability target:** Many merged atoms per open workday (ticks ~60min).
Founder brakes with `good evening team` — not required between atoms. Slack T1
only on routine ships; full detail in repo.
