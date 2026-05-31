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

2026-05-30 | Generic extractRows() with 7 response shapes handles all 100 panels without per-panel switch | apps/web/app/og/[panel]/route.tsx | ACCEPTANCE Gate 2 (Lab renderers) | keep | Satori constraints: display:flex everywhere, no grid; agentForPanel() from @razzle/agents avoids metadata duplication; parameterized API paths ({player_id}) correctly skipped
2026-05-31 | Lab demo rows in [panel] route | 0019814f | keep | H2H DEMO pattern; Satori single-child blurb
2026-05-31 | MC OG two-file slice | da33eafd | keep | POST /api/bureau/monte-carlo + DEMO_ODDS fallback; export gated on Sleeper user
2026-05-31 | Lab OG launch10 demos cycle 61 + param defaults cycle 62 | epic complete | keep | da09d5b4 ef908a99
