# Evidence — explore-og-college-band-copy

**Date:** 2026-05-31  
**Atom:** `explore-og-college-band-copy`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc'
curl -s -o /tmp/og-college-qb.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&pos=QB'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| College OG default | `200 36128` PNG 1200×630 |
| College OG QB filter | `200 32950` |
| Subtitle default | `college stats · filter any stat · build any view` |
| Band link | `razzle.lol/explore?universe=college` |

## Change

College `/og/explore` uses human stat labels in subtitles, college default tagline, and universe-specific band URL — parity with NFL screener OG card structure.
