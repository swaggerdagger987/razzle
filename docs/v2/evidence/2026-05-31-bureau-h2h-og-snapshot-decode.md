# Evidence — Bureau H2H OG snapshot decode

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-og-snapshot-decode`  
**Slice:** H2H OG route prefers snapshot param over API refetch

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_self_scout.py -q
curl -s -o /tmp/og-h2h-snap.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/head-to-head?download=1&snapshot=eyJ5Ijp7InQiOiJTYW1wbGUgU3F1YWQiLCJyIjoiOC01IiwicCI6MTE4LjR9LCJtIjp7InQiOiJSaXZhbCBGQyIsInIiOiI3LTYiLCJwIjoxMTIuMX0sInBjIjpbeyJwIjoiUkIiLCJ5Ijo0LCJtIjoyfSx7InAiOiJXUiIsInkiOjUsIm0iOjZ9XX0'
curl -s -o /tmp/og-h2h-base.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/head-to-head?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | PASS |
| pytest bureau self-scout | 2 passed |
| OG with snapshot param | `200 57048` bytes, PNG 1200×630 |
| OG baseline (no snapshot) | `200 59305` bytes |

## Implementation

- `decodeBureauH2HOgSnapshot()` mirrors compact encode format in `bureau-h2h-og-snapshot.ts`
- `/og/head-to-head` skips API fetch when valid snapshot present; subtitle labels export

## Verdict

PASS — Gate C satisfied; snapshot path renders rivalry card without refetch.
