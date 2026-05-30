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

2026-05-30 | Lab L5 OG panel data rows | same pattern as /og/explore (cycle 55): fetch API → extract → render Satori JSX | PENDING_HASH | keep | keep | — | npm run build pass; 52 tests pass; single file ~180 lines
