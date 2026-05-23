# Board Meeting — Cofounder Product Review

Every **10 cycles**, the loop **must** hold a board meeting — no exceptions, no skips, no "we'll catch up later." A full passover of codebase and product. Four independent audits, then joint election: **KEEP · DELETE · REFINE**.

Normal council cycles ship slices. Board meetings ask: *"Would we be proud to open this on Sunday morning?"*

**Board meetings are more important than feature cycles.** When due, the shell runs board **before** shipping the next slice.

---

## Why this exists

Single-model `--continuous` cycles produce velocity but rubber-stamp audits. Board meetings restore **real separation** with four independent models:

| Phase | Model | Job |
|-------|-------|-----|
| Code audit | **Codex** | Shims, stubs, copy-paste, dead code, docs lies |
| Product audit | **Opus** | Finished vs embarrassing vs north star; Reddit readiness |
| Priority audit | **Gemini** | **Independent** — what actually matters to implement; what's being ignored; north-star gaps |
| Synthesis | **Composer** | Draft KEEP / DELETE / REFINE from all three audits |
| Ratify | **Opus + Codex + Gemini** | Vote APPROVE / AMEND / REJECT on each row |
| Execute | **Composer** | Approved DELETEs + quick REFINE wins; commit |

Gemini is **not** a tiebreaker — a fourth cofounder who asks: *"Are we building what users need, or what's easy to log as keep?"*

---

## The reward is not debate

Cofounders are **not** scored on agreeing or disagreeing. They want Razzle to exist — for themselves, for Sunday waivers, for dynasty Reddit.

> **The joy of a truly finished product.**

HALF-DONE is worse than deleted. Vote for what makes the product **feel done**, not what makes the thread sound smart.

---

## Never skip a board meeting

| Rule | Enforcement |
|------|-------------|
| Due every 10 cycles | `floor(cycle/10) > floor(last_board/10)` OR `cycle - last_board >= 10` |
| Missed window | Catch up immediately on next loop iteration — no waiting for round decade |
| Manual | `./scripts/v2_loop.sh --board` always runs full board |
| Git race | `.board-lock` — feature loop waits while board executes |
| Incomplete board | Shell retries until `### Board Verdict` + `last_board_cycle` updated |

---

## Audit passover (Codex + Opus + Gemini)

All three run gates before writing:

```bash
git log --oneline -40
git diff --stat HEAD~40..HEAD
./.venv-v2/bin/pytest apps/api/tests -q
npm run build
```

**Codex** tags: FINISHED | HALF-DONE | DELETE-CANDIDATE | REFINE-CANDIDATE (code evidence)

**Opus** tags: ship vs hide vs screenshot (product evidence)

**Gemini** tags: PRIORITY-HIT | PRIORITY-MISS | SCOPE-CREEP | NORTH-STAR-DRIFT (what matters vs what's being built)

---

## Election format

```markdown
## Board Meeting — After Cycle N

### KEEP | DELETE | REFINE tables
DELETE vote columns: Opus | Codex | Gemini | Composer

### Board Verdict
- DELETE executed: …
- REFINE queued: …
- Commit: `<hash>`
```

**DELETE:** **3/4 APPROVE** required (four board members)

**REFINE:** **3/4 APPROVE** OR unanimous on quick wins executed same session

---

## Scheduling

| Trigger | When |
|---------|------|
| Auto | Never skip — due when decade window passed since `last_board_cycle` |
| Manual | `./scripts/v2_loop.sh --board` |
| Interval | `RAZZLE_BOARD_INTERVAL=10` (default) |

Updates `LOOP-STATE.md`: `last_board_cycle: N`

---

## After the board

Feature cycles resume. Read Board Verdict before proposing next slice.
