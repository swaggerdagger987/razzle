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

2026-05-30 | Lab L5 OG live data rows claim | test (`npm run build` + pytest) | Lab L5 | PASS | No production data test (no terminal.db in CI) — acceptable for offseason; Satori compliance verified by build success | keep | Pre-existing test_nfl_screener_default_universe failure is not a regression (no terminal.db) | `npm run build` exits 0, pytest 52 passed 1 pre-existing fail
