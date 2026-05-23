# How to run the cofounder loop (Cursor credits only)

**Do not use `claude` CLI** — that bills Anthropic separately. Use **Cursor Agent** (IDE chat or `cursor-agent` CLI).

**Skill file:** `docs/v2/PROGRAM.md` — read this first. Like [karpathy/autoresearch](https://github.com/karpathy/autoresearch), the program defines the metric, fixed constants, and NEVER STOP rule.

---

## Continuous loop (recommended — never stops)

No 5m/75m wake timers. No start-stops — **that is decay**. The shell chains cycle → cycle → cycle until you Ctrl+C.

### Cursor IDE — paste once, walk away

Open **Agent** chat and paste:

```
Execute loop-prompt-continuous.txt — continuous cofounder loop per docs/v2/PROGRAM.md
```

The agent runs council → build → audit → brand → score → log → **immediately** starts the next cycle.

It **never** stops because FEATURES.md went GREEN. It climbs DEPTH layers in PARITY.md forever.

### Terminal — shell chains cycles (recommended)

```bash
cd "/Users/sohammehta/Desktop/05 - Code Projects/Legacy Razzle/razzle"
./scripts/v2_loop.sh --continuous
```

This runs **cycle → cycle → cycle** with **zero sleep**. Only stops on Ctrl+C.

**Commit gate:** If the working tree is dirty, the shell enters **survival mode** — infinite agent recovery (Codex → Opus → Composer) + emergency auto-commit. Never exits until clean. Log: `docs/v2/recovery.log`.

**Important:** A single `cursor-agent` session cannot be trusted to self-loop — it will print "PRODUCT COMPLETE" and exit. The **shell wrapper** is what keeps it continuous.

### Boot localhost (fix Internal Server Error)

Stale `next dev` on :3000 causes 404/500 on `/lab`, `/league`. Restart clean:

```bash
./scripts/dev_stack.sh
```

**Do not use** `/loop 5m` or `/loop 75m` — start/stop timers are deprecated. They waste compound intelligence.

---

## Single cycle (manual)

```
Execute loop-prompt-v2.txt — one full cofounder cycle per docs/v2/PROGRAM.md
```

Or: `./scripts/v2_loop.sh 1`

---

## 3-model split (Opus / Codex / Composer as equals)

```bash
./scripts/v2_loop.sh --steps-continuous   # chains forever, 5 agent calls per cycle
```

Each model calls the others out. 2/3 SHIP to build.

---

## How to know it is working

| Signal | Good sign |
|--------|-----------|
| `git log -1` | New commit every cycle — hash matches results.tsv |
| `git status` | Clean before next cycle starts |
| `docs/v2/results.tsv` | New row every cycle; no `keep` with `commit=none` |
| `docs/v2/COUNCIL.md` | Three equals replying by name; no idle gaps |
| `docs/v2/LOOP-STATE.md` | `cycle:` keeps climbing |
| `git status` / diffs | Code changes between cycles |
| Stuck | Only markdown, no code → re-paste continuous prompt |

---

## Stop the loop

- **IDE:** stop the agent run in Cursor
- **Terminal:** `Ctrl+C` on `./scripts/v2_loop.sh --continuous`

Only the human stops the loop. The agent never asks permission to continue.

---

## Pre-flight

```bash
python3 scripts/sync_data.py --status
JWT_SECRET=dev .venv-v2/bin/uvicorn apps.api.main:app --reload --port 8000 --app-dir .
npm run dev
```

http://localhost:3000/explore should load players.

---

## Compound intelligence

Read `docs/v2/results.tsv` before each cycle. Cycle N should reference what cycles 1…N−1 learned. Discarded experiments stay discarded unless new evidence appears in REDDIT-INTEL or ACCEPTANCE failures.
