# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Epic:** Lab L5 — LIVE nflverse sticker on launch-10 OG (atom 2/3)  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
npm run dev --workspace=apps/web -- -p 3000
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?position=WR&download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
```

## Results

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?position=WR&download=1` | 200 | 51431 | PNG 1200×630 |
| `/og/weekly?download=1` | 200 | 66512 | PNG 1200×630 |

## Change

- `liveOgStickerLabel()` — prospects `LIVE · RPS board`, weekly `LIVE · heatmap rows`.
- Blurb suffix: `live RPS ranks` / `live heatmap` when `showingLiveData`.

## Dedup

- Atom 1/3 (`4e905360`) generic sticker on base — this atom scopes Hawkeye copy only.
