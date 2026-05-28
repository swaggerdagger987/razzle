# Company State

Small, machine-readable state files the Automations share. **Not** the
canonical state of the product — that lives in `docs/v2/STATUS.md` and
`docs/v2/results.tsv`.

These files are the **operating semaphore** for the Slack-driven workday.

---

## Files

| File | Purpose | Owner |
|------|---------|-------|
| `workday.json` | Is the team currently working? When did the workday start? How many cycles ran? | Morning + Evening + (later) Tick automations |

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

- Morning Standup ("good morning team") **always writes** the file:
  `status=open`, `started_at=now`, `closed_at=null`, `cycle_count_today=0`.
- Closing Log ("good evening team") **always writes** the file:
  `status=closed`, `closed_at=now`. Other fields preserved.
- Loop Tick (deferred) **reads** the file. If `status=closed`, exits silently.
  If `status=open`, runs one cycle and increments `cycle_count_today`.

### Concurrency

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

- Not a queue. The slice queue is `docs/v2/PARITY.md`.
- Not a status board. Live build status is `docs/v2/STATUS.md`.
- Not a memory file. Per-role memory is `docs/company/memory/<role>.md`.
- Not a results log. Cycle outcomes go in `docs/v2/results.tsv`.

This file exists for one reason: so that "good morning team" and "good
evening team" can hand the workday to each other across separate Cursor
Cloud Agent VMs.
