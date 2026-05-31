# Evidence — explore-og-college-hawkeye-note

**Date:** 2026-05-31  
**Atom:** `explore-og-college-hawkeye-note`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-college-note.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/explore?universe=college&...&download=1` | 200 | 37393 | 1200×630 |

## Change

College Explore OG card shows first qualifying Hawkeye margin note (e.g. "target hog on campus") between the row table and terracotta watermark band.
