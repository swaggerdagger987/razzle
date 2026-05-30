# Memory — Engineering Architect

Append-only log of architecture decisions, boundary lessons, recurring failure modes.

Format per entry:

```
YYYY-MM-DD | hypothesis | implementation boundary | ACCEPTANCE check | outcome | keep | discard | revisit | evidence
```

Read this file before scoping a new slice. Track which boundaries failed before,
which migrations were painful, which test patterns caught bugs.

---

## Entries

2026-05-30 | Generic extractRows() over switch-per-panel keeps code surgical | apps/web/app/og/[panel]/route.tsx only | Gate 5 npm build + Gate 2 Lab render | keep | Evidence: 8 response shapes, single-file, build green
