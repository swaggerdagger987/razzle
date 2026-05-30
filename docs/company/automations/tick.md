# Automation: Loop Tick — ACTIVE WHEN CONFIGURED

> **Status: ACTIVE WHEN CONFIGURED.** The 24/7 factory. Configure on ~60 minute
> schedule. Ticks run while `workday.json` is `open` between `good morning team`
> and `good evening team` (or until stall rule fires).

---

## What this Automation does

- Fire on a schedule (every ~60 minutes while factory should run).
- Read `docs/company/state/workday.json`.
- If `status: closed`, exit silently. Post nothing.
- If `status: open`, run one Standard Company Loop cycle (one atom, one PR).
- Read `current-epic.json` for next atom; advance epic after merge.
- Post **T1 Slack** (10–15 words) on routine merge per SLACK-FORMATS.md.

---

## Stop rules (evidence-based only)

- Same slice NEEDS WORK or BLOCKED **twice** in a row → stall, T2 Slack, exit.
- Publish blocked after push + ManagePullRequest → T2 Slack, exit.
- Founder Board due (every 10 cycles) → run Board in VM before next slice.
- `good evening team` closed workday → silent exit on next tick.
- No arbitrary daily cycle cap.

---

## Dashboard config

| Field | Value |
|-------|-------|
| Trigger | Schedule → every ~60 minutes |
| Repository | `swaggerdagger987/razzle` |
| Base branch | `razzle-v2-redesign` |
| Model | Opus for new epic / PARITY tie; **Sonnet behavior** for routine next-atom PLAN; **Composer behavior** for BUILD |
| Tools | **Open Pull Request**, Send to Slack, Memories |
| Scope | **Team Owned** |

---

## Prompt body

```text
PROMPT_VERSION: 2026-05-31.v2

You are the Razzle Company OS on a **loop tick**. Ship the next atom while the
workday is open. Read docs/company/FACTORY-VISION.md and docs/company/SLACK-FORMATS.md.

WORKDAY GATE — before any work:
1. Acquire company-os-lock. If held by live run → exit silently (no Slack).
2. Read docs/company/state/workday.json. If status != "open" → release lock, exit silently.
3. Read docs/company/state/current-epic.json. If next_atom_id is null and
   epic_status=complete → Phase PLAN: new epic (Opus rules) or exit silently if
   no PARITY candidate.
4. Founder Board due every 10 cycles (workday.cycle_count_today) → run Board first.
5. Do NOT modify workday started_at or closed_at.

PHASE PLAN (tick — prefer cheap path):
- If next_atom_id set and atom status pending/next: **Sonnet behavior** — write
  current-slice.json from that atom only. Read PARITY/DEPTH row cited in epic.
  Do NOT re-read 30+ docs. Budget ≤10k input for routine pick.
- If ambiguous PARITY tie or new epic needed: Opus rules from good-morning.md P0–P1.
- Dedup: results.tsv last 5 + merge-base — skip merged atoms, advance epic file.

CYCLE EXECUTION: Follow good-morning.md Steps 1–7, 8 (two-commit + publish),
9 (PR + merge), 9.5 (FACTORY-DOD).

After merge: update current-epic.json (atom done, advance next_atom_id).

METADATA: increment cycle_count_today; set last_cycle_commit; last_trigger=loop tick.

SLACK (SLACK-FORMATS.md — NOT roll call):
- Routine merge + Reality PASS: **T1** one line, 10–15 words. Example:
  "Merged: Bureau H2H OG shows real Sleeper rows — Lab L5."
- NEEDS WORK / BLOCKED / stall: **T2** ≤25 words.
- Silent gate exit: no post.

ADDITIONAL CONSTRAINTS:
- Same slice NEEDS WORK twice → mark atom blocked in epic, T2 Slack, exit.
- No clear next atom → exit silently.
- Release run lock at end.
- Never local-only commit when Cursor PR tools available.
```

---

## Expected Slack output

```
Merged: Bureau H2H OG shows real Sleeper rows — Lab L5.
```

---

## When to disable

- Reality FAIL rate >50% over a week.
- Three stall events in 5 days.
- Repeated BLOCKED: GITHUB_PUBLISH.
- Founder disagrees with direction — toggle off in dashboard; use `good evening team`.
