# Company State

Machine-readable state files Automations share. Product truth lives in
`docs/v2/STATUS.md` and `docs/v2/results.tsv`.

---

## Two-lane handoff

| Lane | Automation | Writes |
|------|------------|--------|
| Strategy | [strategy-review.md](../automations/strategy-review.md) | `current-epic.json`, `current-slice.json`, `strategy-last-run.json` |
| Build | [team-build.md](../automations/team-build.md) | `workday.json` cycle counters, standups, `results.tsv` |

Team Build **must not** run when `strategy-last-run.json` → `next_slice_ready` is false.

---

## Files

| File | Purpose | Owner |
|------|---------|-------|
| `workday.json` | Open/closed factory semaphore | Morning open, Evening close, Build reads |
| `current-epic.json` | Epic + atom queue | Strategy |
| `current-slice.json` | Builder contract (`atom_id` must match epic `next_atom_id`) | Strategy writes, Build reads |
| `strategy-last-run.json` | Last strategy run + contract freshness | Strategy writes, Build gates on |

---

## `strategy-last-run.json`

Schema: [strategy-last-run.schema.json](./strategy-last-run.schema.json).

- **Strategy** sets `next_slice_ready: true` after writing aligned epic + slice.
- **Team Build** exits silently if `next_slice_ready` is false or `atom_id` mismatch.

---

## `workday.json`

```json
{
  "status": "open" | "closed",
  "started_at": "<ISO 8601 UTC>" | null,
  "closed_at": "<ISO 8601 UTC>" | null,
  "cycle_count_today": 0,
  "last_trigger": "good morning team" | "good evening team" | "team build" | null,
  "last_cycle_commit": "<7-char SHA>" | null
}
```

- **Morning:** `status=open`, reset `cycle_count_today=0`.
- **Evening:** `status=closed`.
- **Team Build:** increment `cycle_count_today` after merge.

---

## `current-epic.json` / `current-slice.json`

See [current-epic.schema.json](./current-epic.schema.json) and
[current-slice.schema.json](./current-slice.schema.json).

Strategy advances epic after reviewing merges — not Team Build.

---

## What this is not

- Backlog catalog: `docs/v2/PARITY.md`
- Active sprint pointer: `current-epic.json`
