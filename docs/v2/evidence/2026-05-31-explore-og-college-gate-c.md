# Evidence — explore-og-college-gate-c

**Date:** 2026-05-31  
**Atom:** `explore-og-college-gate-c`  
**Verdict:** PASS

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_og_college_gate_c.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-college-gate.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1'
file /tmp/og-college-gate.png
```

## Results

| Check | Result |
|-------|--------|
| Pytest | 3 passed |
| Web build | exit 0 |
| College OG fixture | `200 69173` PNG 1200×630 (re-verified cycle 135, force_demo=1) |
| Demo copy | `campus stats preview` when SAMPLE |

## Change

College `/og/explore` uses `DEMO_COLLEGE_ROWS` when screener empty; campus-specific SAMPLE subtitle; `force_demo=1` fixture param for Gate C verification.
