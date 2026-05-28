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

2026-05-28 | OG route rewrite: single-file touch using existing catalog + registry, generic row extraction for 6+ response shapes | apps/web/app/og/[panel]/route.tsx only | ACCEPTANCE Gate 2 + Gate 5 | keep | keep | — | Build passes, 52/52 relevant tests pass. Follow-up: production tier bypass for OG routes, OG-specific snapshot test.
