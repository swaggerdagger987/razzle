# Cursor Automations

Prompt bodies for Razzle Company OS. Dashboard: `cursor.com/automations`.

**Version:** `2026-06-01.v1` — see [VERSION.md](./VERSION.md).

---

## Two-lane factory

| Lane | Spec | Model |
|------|------|-------|
| Strategy | [strategy-review.md](./strategy-review.md) | Sonnet (not Auto) |
| Build | [team-build.md](./team-build.md) | Auto or Composer |
| Open | [good-morning.md](./good-morning.md) | Auto or Sonnet |
| Brake | [good-evening.md](./good-evening.md) | Sonnet |
| Q&A | [ask-team.md](./ask-team.md) | Auto or Sonnet |

Deprecated: [tick.md](./tick.md) → use Team Build.

---

## Automations

| Name | Trigger | Spec |
|------|---------|------|
| Morning | `good morning team` | `good-morning.md` |
| Strategy & Review | Schedule 4h + `plan team` | `strategy-review.md` |
| Team Build | Schedule ~60min | `team-build.md` |
| Ask The Team | Role prefixes | `ask-team.md` |
| CEO Nightly | `good evening team` | `good-evening.md` |

State: [state/README.md](../state/README.md).

---

## Setup

See [HARNESS.md](../HARNESS.md) § Phase 2 — five automations table.

**Test order:** `good morning team` → `plan team` → wait for Team Build → `good evening team`.

---

## Updating prompts

Edit `.md` → PR → copy to dashboard → bump VERSION.md.
