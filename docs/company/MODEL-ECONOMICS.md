# Model Economics — Sustainable Factory

**Law:** Expensive models **decide** (Strategy lane). **Auto / Composer** **types**
(Team Build lane). One VM = one billed model — split automations, do not "behave
like Composer" on Opus.

---

## Two-lane factory (required)

```text
Strategy & Review (~every 4h)  →  current-epic.json + current-slice.json
Team Build (~every 60min)     →  implement contract → merge → T1 Slack
```

| Lane | Automation | Dashboard model | Input budget |
|------|------------|-----------------|--------------|
| **Strategy** | [strategy-review.md](./automations/strategy-review.md) | **Sonnet thinking** (Opus when new epic / PARITY fork) | ≤ 20k |
| **Build** | [team-build.md](./automations/team-build.md) | **Auto** or **Composer 2.5 Fast** | ≤ 50k |
| **Open factory** | [good-morning.md](./automations/good-morning.md) | Auto or Sonnet | ≤ 5k |
| **Brake** | [good-evening.md](./automations/good-evening.md) | Sonnet | ≤ 30k |
| **Q&A** | [ask-team.md](./automations/ask-team.md) | Auto or Sonnet | ≤ 15k |

**Do not use Auto on Strategy.** Judgment-heavy; unpredictable cost.

**Auto on Build:** experiment 48h. If spend ≈ Opus, pin **Composer 2.5 Fast**.

Deprecated: monolithic [tick.md](./automations/tick.md) (plan+build on one Opus run).

---

## Per-run budgets

| Phase | Where | Budget |
|-------|-------|--------|
| Strategy review + contract | strategy-review.md | ≤ 20k |
| Build + verify | team-build.md | ≤ 50k |

Target mix while workday open: **~6 strategy runs + ~24 build runs** → majority
build spend if Build dashboard is Auto/Composer.

---

## Strategy read list

1. `current-epic.json`, `strategy-last-run.json`, `workday.json`
2. Last 5 `results.tsv` rows
3. PARITY rows **cited by epic only**
4. Last 1–3 merged standup diffs

No AGENTS.md, no six role files, no full PARITY every run.

---

## Build read list

1. `current-slice.json`
2. `allowed_paths` only
3. `FACTORY-DOD.md`, `SLACK-FORMATS.md`

No epic decomposition. No PARITY browse.

---

## Cost anti-patterns

| Pattern | Fix |
|---------|-----|
| Opus on Team Build dashboard | Auto or Composer |
| Auto on Strategy | Sonnet / Opus explicit |
| Build without `next_slice_ready` | Gate on strategy-last-run.json |
| Monolithic tick | team-build.md + strategy-review.md |
| Re-read 30+ docs per build | Build read list only |

---

## Scorecard (evening review)

- `plan_tokens_est`: low / ok / over (build:strategy run ratio)
- `atoms_shipped`, `duplicate_slice`, `merge_on_base`, `guardrail_incidents`
- `strategy_runs_today`, `build_runs_today`

Founder pins Composer on Build when `over` repeats.

---

## Sustainability target

Many atoms per open workday. Strategy ~4h; Build ~60min. Slack T1 per merge.
Brake with `good evening team` when cost spikes.
