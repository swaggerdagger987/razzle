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
2026-05-31 | Lab OG demo rows — DEFAULT_DEMO_ROWS + slug overrides | 0019814f | keep | Mirrors H2H demo pattern; Gate C curl 59KB PNG
2026-05-31 | Monte Carlo OG + Bureau export button | da33eafd | keep | ~190 line route + export link gated on getSleeperUser()
2026-05-31 | Lab OG launch10 + param defaults | ddc28666 | keep | DEFAULT_OG_PLAYER_ID; dynasty-comps Match % demo; curl 65961B
