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
2026-05-30 | League L5 — new /og/head-to-head route (you/them cards, position depth bars, trade lanes, Atlas badge, watermark) + export-card link in BureauHeadToHead | 9ea2e16 | keep | ~250 lines following cycle 55/57 OG pattern; graceful null-data fallback to Atlas loading copy; link gated on you?.user_id; tsc + npm run build green, route registered as dynamic
