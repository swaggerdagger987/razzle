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

2026-05-30 | Lab L5 OG live data rows | test (npm run build + pytest + tsc) | Lab L5 DEPTH claim verified | PASS | no terminal.db on CI VM means data-path is untested end-to-end; fallback path (empty data → icon + loading copy) verified; production needs NEXT_PUBLIC_API_ORIGIN env var | keep | future: add OG snapshot test with fixture data
2026-05-31 | Lab OG demo rows | build + curl PNG ~59KB | PASS | 0019814f on base via PR #23
2026-05-31 | MC OG | build + curl PNG ≥40KB | PASS | da33eafd — see evidence file
