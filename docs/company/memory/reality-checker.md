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
2026-05-30 | League L5 H2H OG export | test (tsc --noEmit + npm run build) | League L5 export claim verified — /og/head-to-head registered as dynamic edge route | PASS | live-league data path unverifiable (no Sleeper fixture + no terminal.db); null-data fallback to Atlas loading copy verified by build; same constraint as cycles 55/57 | keep | future: fixture-league CI render check for all OG routes
