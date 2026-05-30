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

2026-05-30 | Lab L5 OG live data rows | Generic extraction: try players→candidates→items→rows→data→rankings→values→leaders→results then tiers.players then top-level array. Agent owner from `agentForPanel()`. Position pills reuse POS_COLOR map from Explore OG | c02bed4 | keep | Reuse `/og/explore` pattern proven in cycle 55; 150 lines handles all 100 panels | `npm run build` green, pytest 52 passed
