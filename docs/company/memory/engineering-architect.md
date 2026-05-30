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

2026-05-30 | Generic row extraction (9-key fallback) handles 100 panel slugs without per-panel code | single file touch `/og/[panel]/route.tsx` | Gate 5 npm run build | SHIP, build green | keep | Satori constraints: display:flex on every node, no grid. Proven in cycle 55-56. Edge runtime → API fetch pattern works | `npm run build` exits 0
