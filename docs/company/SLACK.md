# Operating the Razzle team from Slack

Operator cheat sheet. **Two-lane factory:** Strategy plans; Team Build ships.

---

## TL;DR

- **`good morning team`** — open factory (workday)
- **`plan team`** — manual strategy refresh
- **Team Build** — runs on schedule (~60 min) while open
- **`good evening team`** — brake factory
- **Role prefixes** — Q&A (`Strategist:`, etc.)

---

## Triggers

| You say | What happens |
|---------|----------------|
| `good morning team` | `workday.json` → open; T1 Slack |
| `plan team` | Strategy & Review — epic + next slice contract |
| *(schedule)* | Strategy every 4h; Team Build every 60min |
| `good evening team` | Close workday; T3 digest |
| `Strategist:` etc. | Ask Team (≤40 words) |

---

## Models (dashboard)

| Automation | Model |
|------------|-------|
| Team Build | **Auto** or Composer 2.5 Fast |
| Strategy & Review | Sonnet thinking (not Auto) |
| Morning / Ask | Auto or Sonnet |
| Evening | Sonnet |

See [MODEL-ECONOMICS.md](./MODEL-ECONOMICS.md).

---

## After `good morning team`

1. Ensure **Strategy** automation runs (`plan team` or wait for 4h schedule).
2. When `strategy-last-run.json` → `next_slice_ready: true`, **Team Build** ships.
3. Skim **T1** lines (10–15 words per merge).
4. **`good evening team`** when you want to pause spend.

Full detail: standup PRs, [HARNESS.md](./HARNESS.md), [automations/README.md](./automations/README.md).
