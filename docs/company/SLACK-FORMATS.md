# Slack Formats — CEO Notification Law

Slack is the **decision surface** for the Founder. The repo (standup, PR, evidence,
`results.tsv`) is the **record**. Automations must not post standup theater to Slack.

**Read this before Step 10** in morning/tick prompts and Step 9 in evening prompts.

---

## Principle

You are notifying a **CEO**, not narrating a meeting. Every Slack message must answer:
*What changed for the product, and do I need to act?*

Roll call, trust pillar lists, and evidence dumps belong in
`docs/company/standups/YYYY-MM-DD.md` and the PR body — never in the channel.

---

## Notification tiers

| Tier | When | Slack format |
|------|------|--------------|
| **T1 — Ship** | Routine merge, Reality PASS | **One line, 10–15 words.** Optional PR URL on same line. |
| **T2 — Attention** | NEEDS WORK, BLOCKED, epic pivot, guardrail breach, publish blocked | **One line, ≤25 words** — root cause + single Founder action (or "none"). |
| **T3 — Brake** | `good evening team` or auto-pause recommendation | **≤5 lines** — atoms shipped, epic progress, cost band, exceptions only. |
| **Silent** | Workday closed, lock held, no slice, tick gate exit | **No post.** |

---

## T1 — Ship (10–15 words)

Use one of these patterns:

```text
Merged: <user-visible outcome> — <room/layer or PARITY ref>.
```

```text
Factory open: <epic name>, atom <n>/<total> — <today's atom title>.
```

```text
<Room> <layer>: <user-visible outcome>. PR #<n>.
```

**Examples:**

- `Merged: Bureau H2H OG card shows real Sleeper rows — Lab L5.`
- `Explore screener: age filter rejects bad input — trust T1.`
- `Factory open: Lab L5 depth epic, atom 1/5 — H2H OG route.`

**Forbidden in T1:**

- Six-role roll call (`Chief:`, `Strategist:`, …)
- `Team is awake.` / `Loop tick.` without substantive outcome
- `Founder tonight: review only if…` on routine merges
- Trust pillar laundry lists (log in standup / `results.tsv`)
- Verdict + slice + PR + hash + merge status as separate paragraphs

**Internal tracking (not in Slack):** Record PR URL, content hash, merge state in
standup and PR body. Gate D still requires git truth; Slack omits pipeline prose.

---

## T2 — Attention (≤25 words)

```text
Blocked: <root cause>. <single action or "watching">.
```

```text
Stalled <slice>: NEEDS WORK twice — paused until good morning team.
```

```text
Loop busy — lock held by another run.
```

```text
BLOCKED: GITHUB_PUBLISH — see HARNESS.md. Hash <7-char>.
```

Use T2 for anything that needs Founder eyes before the factory continues on that slice.

---

## T3 — Brake digest (≤5 lines)

When the Founder sends `good evening team` or the run recommends pause:

```text
Paused. <N> merged today, epic <M>/<total>. <one exception or "clean">.
Next atom: <title>. Full review PR #<n>.
```

Empty day (no Company OS work):

```text
No factory work today. Team resting.
```

Full CEO action list, role reflections, MODEL-ECONOMICS scorecard →
`docs/company/standups/YYYY-MM-DD-review.md` and nightly review PR only.

---

## ask-team responses

| Prefix | Max length | Format |
|--------|------------|--------|
| Single role | ≤40 words | `<Role>: <direct answer>` + evidence pointer if needed |
| `Team:` | ≤50 words | One **Recommended action** line — no six-role roll call |
| `Board:` | ≤80 words | KEEP / DELETE / REFINE summary only |

---

## FACTORY-DOD Gate D compliance

| Claim in git/standup | Slack tier |
|---------------------|------------|
| Merged on base | T1 ship line (outcome-focused) |
| NEEDS WORK / open PR | T2 |
| BLOCKED publish | T2 |
| Evening close | T3 |

**Gate D FAIL:** Six-role roll call in Slack, T1 over 15 words, or "merged" claim
when Gate B failed.

---

## Version

Prompt version: `2026-05-31.v2` — wired in `good-morning.md`, `tick.md`, `good-evening.md`.
