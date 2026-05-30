# Company State

Small, machine-readable state files the Automations share. **Not** the
canonical state of the product — that lives in `docs/v2/STATUS.md` and
`docs/v2/results.tsv`.

These files are an **operating semaphore** for the Slack-driven workday. Merged
PRs are the durable source of truth; open PRs are exceptions or checks pending.

---

## Files

| File | Purpose | Owner |
|------|---------|-------|
| `workday.json` | Is the team currently working? When did the workday start? How many cycles ran? | Morning + Nightly Review |
| `current-epic.json` | Active epic + atom queue; advance after each merge | Morning + Tick (+ Evening read) |
| `current-slice.json` | Planner → Builder handoff: today's atom, allowed paths, acceptance commands | Morning + Tick (Phase PLAN) |

---

## `workday.json`

Schema (illustrative):

```json
{
  "status": "open" | "closed",
  "started_at": "<ISO 8601 UTC>" | null,
  "closed_at": "<ISO 8601 UTC>" | null,
  "cycle_count_today": 0,
  "last_trigger": "good morning team" | "good evening team" | "loop tick" | null,
  "last_cycle_commit": "<7-char SHA>" | null
}
```

### Read/write protocol

- Morning Standup ("good morning team") writes the file and merges it when gates pass:
  `status=open`, `started_at=now`, `closed_at=null`, `cycle_count_today=0`.
- CEO Nightly Review ("good evening team") writes the file and merges it when gates pass:
  `status=closed`, `closed_at=now`. Other fields preserved.
- Loop Tick **reads** `workday.json`. If `status=closed`, exits silently.
  If `status=open`, runs one cycle and increments `cycle_count_today`.

---

## `current-epic.json`

Schema: [current-epic.schema.json](./current-epic.schema.json).

Machine-readable epic + atom queue. Required for 24/7 loop — prevents Opus
re-debating and duplicate routes every tick.

### Read/write protocol

- **Morning (`good morning team`):** If no active epic or `epic_status=complete`,
  Opus writes a new 3–5 atom epic from PARITY/DEPTH/NEXT. Otherwise resume
  existing epic. Set `next_atom_id` atom to `in_progress` during PLAN.
- **After successful merge (morning or tick):** Mark atom `done`, set
  `merge_commit`, append to `completed_atom_ids`, advance `next_atom_id` to
  next `pending` atom. If none left, set `epic_status=complete`, `next_atom_id=null`.
- **Tick PLAN (routine):** Read `next_atom_id`; Sonnet writes `current-slice.json`
  from that atom (no full re-plan). Opus only for new epic or PARITY tie.
- **NEEDS WORK twice on same atom:** Set atom `blocked`; post T2 Slack; tick skips
  until Founder `good morning team` or epic pivot.
- **Evening:** Read-only for digest — report `completed_atom_ids` / total atoms.

Do not rely on standup prose alone for "which atom is next." The epic file wins.

---

## `current-slice.json`

Schema: [current-slice.schema.json](./current-slice.schema.json).

Per-cycle Builder contract. Written in Phase PLAN; read only in Phase BUILD.

---

## Concurrency

Cursor Cloud Agents run in isolated VMs. Two agents writing to this file
concurrently would race, but in practice the day's workflow is:

- One Morning trigger
- (Optionally) Loop ticks, one at a time on a schedule
- One Evening trigger

If you ever fire two morning triggers in the same day, the second one
overwrites the first's `started_at`. Don't do that.

### Why JSON, not Markdown

The Tick automation needs to parse this programmatically with `jq` or
equivalent. Markdown front-matter would work too, but JSON is simpler and
git-friendly.

---

## What this is **not**

- Not a queue. The backlog catalog is `docs/v2/PARITY.md`; the active sprint is
  `current-epic.json`.
- Not a status board. Live build status is `docs/v2/STATUS.md`.
- Not a memory file. Per-role memory is `docs/company/memory/<role>.md`.
- Not a results log. Cycle outcomes go in `docs/v2/results.tsv`.

This file exists for one reason: so that "good morning team", loop ticks, and
"good evening team" have a small shared shape. The PR list and results ledger
remain the living history.
