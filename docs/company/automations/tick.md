# Automation: Loop Tick — DEPRECATED

> **Use [team-build.md](./team-build.md) instead.** This file remains as a pointer
> for existing Cursor dashboard configs named "Loop Tick."

---

## Migration

1. Open Cursor Automations → **Loop Tick** (or create **Team Build**).
2. Replace prompt body with [team-build.md](./team-build.md) fence.
3. Set model to **Auto** or **Composer 2.5 Fast** — not Opus.
4. Keep schedule ~60 minutes.
5. Create separate **[strategy-review.md](./strategy-review.md)** automation (4h + `plan team`).

The monolithic tick (plan + build + verify in one Opus run) caused unsustainable
token spend. Build lane reads `current-slice.json` only; Strategy lane writes it.

---

## What changed

| Old tick | New split |
|----------|-----------|
| Plan epic every 60 min | Strategy every 4h + `plan team` |
| Opus thinking on dashboard | Auto/Composer on Team Build |
| ~80k input per cycle | ~10k build + ~20k strategy (separate runs) |

Do not copy the prompt below. Use team-build.md.

---

## Historical reference (do not use)

Previous version: `PROMPT_VERSION: 2026-05-31.v2` — see git history for full text.
