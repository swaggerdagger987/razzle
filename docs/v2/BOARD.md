# Board Meeting — Cofounder Product Review

Every **10 cycles**, the loop pauses feature work for a **board meeting**: a full passover of the codebase and product surfaces. Three independent audits, then a joint election: **KEEP · DELETE · REFINE**.

Normal council cycles ship slices. Board meetings ask: *"Would we be proud to open this on Sunday morning?"*

---

## Why this exists

Single-model `--continuous` cycles produce good velocity but rubber-stamp audits. Board meetings restore **real separation**:

| Phase | Model | Job |
|-------|-------|-----|
| Code audit | **Codex** | Read the repo — shims, stubs, copy-paste, dead code, lies in docs |
| Product audit | **Opus** | Read Codex + product — what's finished vs embarrassing vs north star |
| Synthesis | **Composer** | Draft KEEP / DELETE / REFINE tables from both audits |
| Ratify | **Opus + Codex** | Vote APPROVE / AMEND / REJECT on each DELETE and REFINE row |
| Execute | **Composer** | Implement approved DELETEs and quick REFINE wins; commit |

---

## The reward is not debate

Cofounders are **not** scored on agreeing or disagreeing. They are aligned on one thing:

> **The joy of a truly finished product.**

You are building Razzle because *you want it*. Dynasty managers on Reddit deserve tools that work — not scaffolding labeled GREEN. HALF-DONE is worse than deleted. A deleted bad panel beats ten panels that 500.

Vote for what makes the product **feel done**, not what makes the thread sound smart.

---

## Audit passover (Codex)

Run before writing:

```bash
git log --oneline -40
git diff --stat HEAD~40..HEAD
pytest apps/api/tests -q
npm run build
```

Inspect:

- Legacy shims (`legacy/backend/live_data`, `sys.path` hacks)
- Stubs claiming real data (zeroed Monte Carlo, empty depth buckets)
- Copy-paste chains (same pattern pasted N times without extraction when warranted)
- `FEATURES.md` GREEN vs `ACCEPTANCE.md` / localhost reality
- God files, duplicate SQL, unbounded queries
- Docs drift (`PLAN.md`, `PARITY.md`, `COUNCIL.md` vs code)
- Dead exports, unused components, orphan evidence files

Tag every area: **FINISHED** | **HALF-DONE** | **DELETE-CANDIDATE** | **REFINE-CANDIDATE**

---

## Product passover (Opus)

Read Codex audit. Ask:

- Would I post this screenshot to r/DynastyFF today?
- Which surfaces would I hide from a friend?
- Does copy pass `VOICE.md` (no "AI" slop)?
- Does the hallway feel connected or siloed?
- What is the **one** half-done thing hurting trust most?

---

## Election format (Composer drafts, all three ratify)

Append to `COUNCIL.md`:

```markdown
## Board Meeting — After Cycle N

### KEEP (finished — do not touch except bugs)
| Item | Evidence | Owner |
|------|----------|-------|

### DELETE (2/3 APPROVE required — removes code or reverts slice)
| Item | Path / action | Why | Opus | Codex | Composer |
|------|---------------|-----|------|-------|----------|

### REFINE (2/3 APPROVE — next 1–3 cycles or fix now if <30 min)
| Item | Acceptance | Priority | Opus | Codex | Composer |
|------|------------|----------|------|-------|----------|

### Board Verdict
- DELETE executed: …
- REFINE queued in LOOP-STATE next_slice: …
- Commit: `<hash>`
```

**DELETE rules:**

- 2/3 APPROVE → Composer executes in same session (revert commit or delete files)
- REJECT with written reason stands unless amended
- Deleting code that **improves** simplicity = board win

**REFINE rules:**

- Max **3** REFINE rows queued — forced prioritization
- Quick wins (<30 min) execute immediately
- Larger REFINE items become `next_slice` in `LOOP-STATE.md`

---

## Scheduling

| Trigger | When |
|---------|------|
| Auto | Every cycle where `cycle % 10 == 0` in `--continuous` / `--steps-continuous` |
| Manual | `./scripts/v2_loop.sh --board` |

Updates `LOOP-STATE.md`: `last_board_cycle: N`

Logs `results.tsv`:

```
cycle  board  score  status  pillar  slice  description
42     b42    refine+simplicity  keep  Board  after-cycle-42 delete stubs refine hallway
```

---

## After the board

Feature cycles resume immediately. Read the Board Verdict before proposing the next slice — do not re-ship DELETE'd work without new evidence.
