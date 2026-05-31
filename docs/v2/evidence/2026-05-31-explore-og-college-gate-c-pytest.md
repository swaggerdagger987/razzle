# Evidence — explore-og-college-gate-c-pytest (2026-05-31)

**Atom:** `explore-og-college-gate-c` (pytest guard; demo rows on base via #1058)  
**Cycle:** 133

## Acceptance

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_share_og_universe.py -q --noconftest
# 4 passed

curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1&force_demo=1'
# 200 67491
```

## Reality

PASS — Gate C college OG ≥40KB; pytest guards DEMO_COLLEGE_ROWS + fixture params.
