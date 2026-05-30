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
2026-05-30 | Route /og URLs through a typed hallway helper, never raw href in components; reuse the <a download> export idiom | d6fc232 | keep | Added toLabExport() mirroring toLab/toRoom; one link in Panels-tab footer; 4 files, no new deps
