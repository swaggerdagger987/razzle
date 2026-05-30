# Memory — Reality Checker

Append-only log of recurring failure patterns, evidence gaps, false-PASS
near-misses, and verification techniques that caught real issues.

Format per entry:

```
YYYY-MM-DD | claim under review | evidence type (curl/screenshot/test) | layer/PARITY claim | verdict | issue class | keep | discard | revisit
```

Read this file before reviewing a claim. Recurring failure classes deserve
explicit checks in the verification routine.

---

## Entries

2026-05-30 | Lab L5 OG panel data rows | test (npm run build + pytest) | DEPTH Lab L5 | PASS | pre-existing test failure (no terminal.db) is not regression | keep | — | Full rendered OG evidence requires production data; build gates sufficient for L5 claim
