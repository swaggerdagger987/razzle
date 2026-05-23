# Continuous Loop — Never Finishes

## What "continuous" means

**Continuous ≠ "until FEATURES.md is all GREEN."**

There will always be work. The loop runs until **you** stop it (Ctrl+C). **Start-stops are decay** — each gap loses compound context. The shell chains cycles with **zero sleep**.

- **Step 1:** Vertical depth — the most intensive screener, lab, league, and situation room ever built. Legacy V1 is a **pitstop** (port handlers, then exceed them).
- **Step 2 (later):** Prune what doesn't earn its depth. Not before.

The loop must never self-declare "PRODUCT COMPLETE" and exit.

## Autoresearch model

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch):

| Fixed (prepare.py) | Variable (train.py) | Metric |
|--------------------|---------------------|--------|
| NORTH_STAR, DESIGN, DECISIONS, ACCEPTANCE, REDDIT | One vertical slice per cycle | Cycle score in `PROGRAM.md` |

Each cycle logs **keep | discard | crash** to `docs/v2/results.tsv`. Read prior rows before proposing — do not repeat discards. **Cycle 29 should be 2900× smarter than cycle 1**, not 29× the same mistakes.

Coding discipline: [Karpathy CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md).

**Skill file:** `docs/v2/PROGRAM.md` — agents read every cycle.

## Cycle priorities (in order)

1. **Localhost works** — `docs/v2/ACCEPTANCE.md` Gates 0–4
2. **One vertical slice** — `docs/v2/DEPTH.md` + `docs/v2/PARITY.md`
3. **Hallway wires** — `docs/v2/HALLWAY.md` checklist on that slice
4. **Agents + intel** — six voices + facts through the slice (`AGENTS.md`, `INTEL.md`)
5. **Reddit worthiness** — screenshot or bot-fact test (`docs/v2/REDDIT.md`)

**Depth, not horizontal expansion.** One panel done deeply beats ten panels stubbed.

## Three equals

Opus, Codex, Composer are **equal cofounders**. Each calls the others out by name. 2/3 SHIP to build. See `COFOUNDERS.md`.

## How to run

```bash
./scripts/v2_loop.sh --continuous   # shell chains cycles forever — NEVER trust one agent session alone
./scripts/dev_stack.sh              # clean localhost boot
```

Paste in Cursor Agent once:
```
Execute loop-prompt-continuous.txt — continuous cofounder loop per docs/v2/PROGRAM.md
```

## What the loop must not do

- Exit because pytest + build passed
- Stop to ask "should I continue?"
- **End a cycle without `git commit`** — uncommitted work is unacceptable decay
- Log **keep** in results.tsv without a real commit hash
- Spread horizontally while Lab/League layers are RED
- Treat V1 parity as the ceiling
- Ship breadth without screenshot-/bot-fact-worthy depth
- Repeat experiments logged as **discard** in results.tsv without new evidence

## Evidence

Every vertical slice adds `docs/v2/evidence/YYYY-MM-DD-<pillar>-<layer>.md`.
Every cycle adds a row to `docs/v2/results.tsv`.
