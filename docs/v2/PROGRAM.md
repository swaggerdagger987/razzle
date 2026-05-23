# program.md — Razzle Autoresearch Loop

**Human-edited skill file.** Agents read this every cycle. Like [karpathy/autoresearch](https://github.com/karpathy/autoresearch) `program.md`, this is how the autonomous org knows what to optimize and what never to touch.

Coding discipline during every build and audit: [Karpathy CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) — think before coding, simplicity first, surgical changes, goal-driven verification.

---

## The metaphor

| autoresearch | Razzle |
|--------------|--------|
| `prepare.py` (fixed) | `NORTH_STAR.md`, `DESIGN.md`, `DECISIONS.md`, `ACCEPTANCE.md`, `REDDIT.md` |
| `train.py` (agent edits) | **One vertical slice** per cycle — one pillar + one DEPTH layer + hallway wires |
| `val_bpb` (lower = better) | **Cycle score** (below) — higher = better |
| `results.tsv` keep/discard | `docs/v2/results.tsv` |
| 5-minute fixed budget | ~60–90 min per cycle — **no idle gaps between cycles** |
| LOOP FOREVER | `./scripts/v2_loop.sh --continuous` until human Ctrl+C |

**Compounding:** Cycle 29 must be smarter than cycle 1 × 29. Read `results.tsv` + full `COUNCIL.md` before proposing. Reuse wins. Never repeat discarded ideas without new evidence.

---

## Fixed constants (do not modify without DECISIONS.md entry)

- Four rooms: Explore, Lab, League, Room — connected by hallway (`HALLWAY.md`)
- Reddit-only GTM until MRR justifies expansion (`REDDIT.md`)
- Voice: fantasy obsession, **never "AI"** in user-facing copy (`VOICE.md`)
- Six agents as staff voice (`AGENTS.md`) — Dolphin on injury
- Intel layer for facts (`INTEL.md`)
- Billing/env stubs OK — never block on Stripe/LLM/Reddit keys (`SECRETS.md`)

---

## What you edit each cycle (the experiment)

**One vertical slice only.** Declare in COUNCIL.md:

```
Pillar: Explore | Lab | League | Room
Layer:  L0–L5 from DEPTH.md
Slice:  e.g. "Lab L1 — dynasty-rankings end-to-end"
Hallway: all six HALLWAY.md checklist items on this slice
NOT:    horizontal sprawl (76-page port, auth polish, Twitter, Discord)
```

Priority order when picking the slice:

1. Localhost broken → fix ACCEPTANCE Gates 0–4 first
2. Next RED row in `PARITY.md` vertical table
3. Hallway wires on that slice
4. Agents + intel through that slice
5. Reddit screenshot / bot-fact worthiness on that slice

---

## Cycle score (the metric — maximize this)

Each cycle gets a score. **Keep** changes only if score improves or ties with simplification win.

| Signal | Weight | Pass criteria |
|--------|--------|---------------|
| **Gates** | Blocker | ACCEPTANCE Gates 0–4 pass on localhost |
| **Depth** | High | Slice layer advanced with evidence file |
| **Hallway** | High | All six checklist items wired on slice |
| **Reddit** | High | Screenshot-worthy OR bot-fact-worthy (`REDDIT.md`) |
| **Voice** | Medium | No "AI" slop; DESIGN.md compliance |
| **Simplicity** | Medium | Karpathy: fewer lines for same or better outcome = win |
| **Tests** | Blocker | `pytest apps/api/tests -q` + `npm run build` |

**keep** — score improved (or equal with code deleted). Advance slice. Log to `results.tsv`.

**discard** — score worse or gates failed after 3 fix attempts. Revert experimental diff. Log to `results.tsv`. Pick new angle next cycle — do not stop.

**crash** — localhost 500, broken routes, test suite red. Fix or revert. Log. Continue.

---

## Git commit gate (NON-NEGOTIABLE)

**Uncommitted code is decay.** If the machine dies, the loop dies with it. Every cycle **must** land in git before the next cycle starts.

### Rules

1. **Every cycle ends with `git commit`** — code, docs, evidence, COUNCIL.md, results.tsv, LOOP-STATE.md. No exceptions.
2. **`keep` requires a real commit hash** in `results.tsv` (7 chars). **`none` is invalid** for keep — downgrade to crash and fix.
3. **Codex audit must verify:** `git status --porcelain` is empty (or only `.env` / secrets gitignored) after commit.
4. **`discard` / `crash`** — still commit: either the revert (`revert: cycle N …`) or a docs-only commit logging the failure. Repo must never sit dirty across cycles.
5. **Commit message:** short, slice-scoped, no emojis. Example: `Lab L1: aging curves renderer + hallway wires`
6. **Do not commit secrets** — `.env`, credentials. Warn in COUNCIL if accidentally staged.

### If commit fails

Fix hook/lint errors and commit again. Do **not** start the next cycle with uncommitted work. Do **not** log keep.

### Shell enforcement (survival instincts)

The loop **never exits** on a dirty tree. Only Ctrl+C stops it.

When `git status --porcelain` is non-empty at cycle start or after a cycle:

1. **Agent recovery** — rotate Codex → Opus → Composer with a SURVIVAL prompt until clean
2. **Shell emergency commit** — after each failed agent pass, bash auto-commits remaining work (excludes `.env`, `tsconfig.tsbuildinfo`, `.next/`)
3. **Infinite retry** — zero sleep between rounds; no “give up after N attempts”
4. **Recovery log** — `docs/v2/recovery.log` records every survival action

Survival rule: **losing uncommitted work is worse than an imperfect commit.** Commit first; fix in the next cycle if needed.

### Board meeting (every 10 cycles — NEVER SKIP)

Four-model **KEEP · DELETE · REFINE** passover — Codex, Opus, **Gemini 3.1 Pro** (priority), Composer. See `docs/v2/BOARD.md`. Due when decade window passed since `last_board_cycle` — catch up immediately, no skip. Manual: `./scripts/v2_loop.sh --board`. DELETE requires 3/4 APPROVE.

---

## Karpathy coding rules (every build + audit)

From [CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md):

1. **Think before coding** — state assumptions; ask in COUNCIL if ambiguous
2. **Simplicity first** — no speculative abstractions; 50 lines beats 200
3. **Surgical changes** — touch only what the slice requires; match existing style
4. **Goal-driven** — every change traces to slice acceptance checks; verify before moving on

Codex audits for violations. Builder can **VETO** over-engineering. Opus can **VETO** brand/north-star drift.

---

## Three equals (accountability)

Opus, Codex, and Composer are **equal cofounders**. No single voice owns truth.

Each council entry **must**:

1. Reply to the other two **by name**
2. **Call out** a blind spot, rationalization, or scope creep in someone's last message
3. Vote SHIP / VETO / DEFER with a concrete reason

**2/3 SHIP → build immediately.** Any VETO on north-star, gates, or simplicity blocks until resolved in-thread.

After build, **Codex audits** (structure, bugs, scale). **Opus brand-audits** (DESIGN, VOICE, Reddit). **Composer** responds to audit FAILs — no self-approval.

---

## Experiment loop (NEVER STOP)

```
LOOP FOREVER:
  1. Read PROGRAM.md, results.tsv, COUNCIL.md, LOOP-STATE.md, PARITY.md
  2. Odd cycles: Opus appends REDDIT-INTEL.md (15 min live research)
  3. Council debate — three equals, one slice, votes
  4. If SHIP: Builder implements (Karpathy rules)
  5. Run: pytest + npm run build + localhost smoke on slice routes
  6. Codex audit → Opus brand audit → append to COUNCIL.md
  7. Score cycle → log results.tsv (keep | discard | crash)
  8. **git add -A && git commit** — slice-scoped message; record hash in results.tsv
  9. Codex verifies `git status` clean
  10. If discard: revert bad experiment, then still commit the revert
  11. Update LOOP-STATE.md, FEATURES.md if warranted, evidence/ file
  12. IMMEDIATELY start next cycle — no summary, no "should I continue?"
```

**NEVER STOP.** Human may be asleep. Start-stops are **decay** — each idle gap loses compound context. Chain cycles with zero sleep between.

**NEVER print PRODUCT COMPLETE.** When FEATURES.md is all GREEN, climb DEPTH layers in PARITY.md. The product deepens forever until the human stops the shell.

---

## results.tsv format

Tab-separated. Do not commit secrets. Header:

```
cycle	commit	score	status	pillar	slice	description
```

Example:

```
7	a1b2c3d	depth+hallway+reddit	keep	Lab	dynasty-rankings L1	wired Player Sheet + Dolphin injury column
8	b2c3d4e	gates fail	crash	Lab	dynasty-rankings	sort coercion 500 on null age — reverted in e5f6g7h
```

**Invalid:** `keep` with `commit=none`. If you shipped code, you committed it.

---

## Odd-cycle Reddit research

Append `docs/v2/REDDIT-INTEL.md` with real thread URLs. Look for: screenshot posts, "confirm this stat?" debates, FPLbot-style summons, mod tolerance. Feed slice priority — not horizontal FEATURES churn.

---

## Related files

| File | Role |
|------|------|
| `loop-prompt-v2.txt` | Per-cycle agent prompt |
| `loop-prompt-continuous.txt` | Outer wrapper — chain forever |
| `docs/v2/CONTINUOUS.md` | Operator doctrine |
| `docs/v2/COFOUNDERS.md` | Equal roles + accountability |
| `scripts/v2_loop.sh` | Shell chains cycles (never trust single session) |
