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

2026-05-30 | Lab L5 OG — rewrite /og/[panel]/route.tsx with live data fetch, agent badge, position pills | 2e11270 | keep | Single file ~250 lines; follows Explore OG pattern from cycle 55; 13 stat candidate keys; graceful fallback to icon+loadingCopy when API returns empty
2026-05-30 | Lab OG empty-data path was loading-copy-only shell | /og/[panel] displayRows = hasRows ? rows : DEMO_ROWS; dropped icon/loadingCopy branch; fixed identical H2H Satori crash | PENDING_HASH | keep | DEMO_ROWS position-diverse 2024 names; "· sample preview" marker; verify next/og routes with next start + curl not just build
