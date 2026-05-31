# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
npm run start --workspace=apps/web -- -p 3000
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/prospects?download=1` | 200 | 60688 | 1200×630 |
| `/og/weekly?download=1` | 200 | 66512 | 1200×630 |

## Notes

- `launch10LiveStickerLabel` + `launch10LiveBlurbSuffix` — prospects show `LIVE · RPS board`, weekly `LIVE · PPG heatmap` when `showingLiveData` (panel API or legacy path returns rows).
- Other Launch-10 slugs keep `LIVE · nflverse rows`.
- Dedup: generic Launch-10 sticker merged atom 1 (`4e905360`); prospects `#rank` labels on base (`46409848`).
