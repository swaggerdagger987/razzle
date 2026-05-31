# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Cycle:** 118

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 59 passed; 1 snapshot drift (dynasty top-30, data sync)
```

## Results

| Route | HTTP | Size |
|-------|------|------|
| `/og/prospects?download=1` | 200 | 68042 |
| `/og/weekly?download=1` | 200 | 67125 |

## Change

Prospects OG `extractRows` accepts `items[]` when `prospects[]` absent so live panel API rows still trigger `LIVE · nflverse rows` sticker (Launch-10).

## Verdict

PASS — Gate C (PNG ≥40KB; live extract path for prospects + weekly on panel API).
