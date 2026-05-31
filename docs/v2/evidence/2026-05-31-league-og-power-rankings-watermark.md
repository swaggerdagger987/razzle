# Evidence — league-og-power-rankings-watermark

**Date:** 2026-05-31  
**Atom:** `league-og-power-rankings-watermark`  
**Route:** `/og/power-rankings`

## Acceptance

| Check | Result |
|-------|--------|
| pytest `test_power_rankings_og_watermark.py` | 1 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| OG PNG curl | 200, 70764 bytes |

## curl

```bash
curl -s -o /tmp/power-rankings-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/power-rankings?download=1"
# 200 70764
file /tmp/power-rankings-og.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — terracotta hallway band, `toLeague` deep link, LIVE/SAMPLE stickers, `resolveApiOrigin` for edge fetch.
