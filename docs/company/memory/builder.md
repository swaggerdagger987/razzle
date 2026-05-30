# Memory — Builder

Append-only log of implementation patterns, surgical wins, things to avoid.

Format per entry:

```
YYYY-MM-DD | slice | approach | commit hash | outcome | keep | discard | revisit | evidence
```

Read this file before implementing. Reuse working patterns; avoid repeating known
failure modes. Karpathy: simplicity first, surgical changes.

---

## Entries

2026-05-30 | Lab L5 OG live data | generic extractRows + agent ownership + position pills | 12fd2ca0 | keep | Evidence: /og/weekly 200 PNG 30KB, /og/rankings 200, build+tests green
