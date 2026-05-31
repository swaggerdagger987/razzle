# Evidence — Lab dashboard OG Gate C live rows

**Date:** 2026-05-31  
**Atom:** `lab-og-dashboard-live-gate-c`  
**Verdict:** PASS

## Contract tests

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_dashboard_gate_c.py -q --noconftest
# 4 passed
```

## Gate C — OG PNG (127.0.0.1:3000, `next start`)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/dashboard?download=1` | 200 | 66547 | PNG 1200×630; demo/live top5+risers+fallers rows; LIVE · roster grades |

Fixture params: `DASHBOARD_OG_GATE_C_PARAMS = "download=1"` (see `test_og_dashboard_gate_c.py`).

## Product

- Route already extracts `top5`, `risers`, `fallers`, `value_picks` from `/api/dynasty-dashboard` payload with `rank_diff` stat key.
- Atom locks Gate C contract so Reality can curl without re-debating route shape.
