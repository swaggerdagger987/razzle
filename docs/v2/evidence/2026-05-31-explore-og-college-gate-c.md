# Evidence — explore-og-college-gate-c (cycle 137)

**Date:** 2026-05-31  
**Verdict:** PASS

```bash
python3 -m pytest apps/api/tests/test_explore_og_college_gate_c.py -q --noconftest
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1'
```

| Check | Result |
|-------|--------|
| Pytest | 3 passed |
| College OG | 200 69173 PNG 1200×630 |

Campus-specific SAMPLE subtitle when `universe=college`; pytest guards demo rows + `force_demo`.
