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

2026-05-28 | Lab L5 OG live data rows | Generic extractRows() handles players/candidates/items/rows/data/buy_low/sell_high/top_players; STAT_KEYS_BY_SLUG for launch-10 stat labels; agentForPanel badge | 06048e3 | keep | keep | — | Build pass, single file 298 lines, position pills + agent badge match DESIGN.md
