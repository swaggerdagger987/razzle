# Company Memory

Append-only memory files — one per role, plus shared logs added when first used.

Every role's autoresearch loop ends with a memory entry. The next run reads its
own memory before proposing, scoping, building, or auditing.

Memory files are the only learning loop the company has at build stage. There are
no users yet, so internal compounding is everything.

A good entry changes future behavior. A bad entry is a diary.

---

## Files

| File | Owner | Purpose |
|------|-------|---------|
| `chief-of-staff.md` | Chief of Staff | Coordination patterns, meeting overhead, handoff lessons |
| `product-strategist.md` | Product Strategist | Slice picks, hypotheses, KILL verdicts, outcomes |
| `engineering-architect.md` | Engineering Architect | Boundary decisions, migration lessons, test patterns |
| `builder.md` | Builder | Implementation patterns, surgical wins, anti-patterns |
| `data-researcher.md` | Data Researcher | Recurring user pain patterns, language signals, feature gaps |
| `reality-checker.md` | Reality Checker | Failure classes, evidence techniques, false-PASS near-misses |
| `decisions.tsv` | Chief of Staff | Company-level decisions (added on first non-trivial entry) |
| `role-scorecards.tsv` | Chief of Staff | Per-run scorecards (added on first scorecard log) |

---

## Entry format

Each role's file uses an append-only format with these fields:

```
YYYY-MM-DD | hypothesis or task | outcome | keep / discard / revisit | evidence
```

Variations per role are documented inside each file.

---

## Review

Memory is reviewed at:

- The start of every role run (read your own memory first).
- Founder Board (every 10 cycles or when triggered) — Chief of Staff scans for
  recurring patterns across roles.
- Hiring/Firing Review — memory quality is a scorecard signal.

If a memory file becomes a diary instead of a behavior changer, the role's
contract or prompt is broken. Fix the prompt, not the memory.
