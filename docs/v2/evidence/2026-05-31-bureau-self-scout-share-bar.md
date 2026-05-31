# Evidence — Bureau Self-Scout share bar

**Date:** 2026-05-31  
**Atom:** `bureau-self-scout-share-bar`

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-scout.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/self-scout?league=test&user=u1&download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | PASS |
| OG self-scout | `200 67554` bytes, PNG 1200×630 |

## Verdict

PASS — Gate C satisfied.
