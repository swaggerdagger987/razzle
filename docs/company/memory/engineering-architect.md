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

2026-05-30 | Generic row extraction (players→candidates→items→rows→data→tiers.players) handles all panel shapes | apps/web/app/og/[panel]/route.tsx | ACCEPTANCE Gate 2 + DEPTH Lab L5 | keep | keep | — | API response keys confirmed: {rows, items}; Satori display:flex constraint respected
