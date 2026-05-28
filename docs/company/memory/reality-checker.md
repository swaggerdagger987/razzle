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

2026-05-28 | Lab L5 OG live data rows claim | test (npm run build + pytest) | Lab L5 DEPTH verified | PASS | No browser evidence possible in CI — code path inspection + build + test substitutes | keep | — | First cycle: establish that build + test + code inspection is minimum evidence bar when no running server is available. Follow-up: add OG snapshot test for stronger future verification.
