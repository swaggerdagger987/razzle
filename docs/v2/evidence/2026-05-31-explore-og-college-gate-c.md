# Evidence — explore-og-college-gate-c

**Date:** 2026-05-31  
**Atom:** `explore-og-college-gate-c`  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_og_college_gate.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-college-gate.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&season=2024'
file /tmp/og-college-gate.png
```

## Results

| Check | Result |
|-------|--------|
| Pytest | 2 passed |
| Web build | exit 0 |
| College OG fixture curl | `200 63592` PNG 1200×630 |

## Change

College `/og/explore` defaults `season=2024` when unset, shows LIVE vs SAMPLE stickers, and renders `collegeOgDemoRows()` when the screener API returns no rows — Gate C ≥40KB without loading-copy-only shells.
