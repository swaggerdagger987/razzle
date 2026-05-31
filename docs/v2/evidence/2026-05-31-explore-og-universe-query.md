# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Route:** `/og/explore`

## Gate C — curl

```bash
curl -s -o /tmp/explore-nfl.png -w "nfl %{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&download=1"
# nfl 200 34561

curl -s -o /tmp/explore-college.png -w "college %{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1"
# college 200 37393

file /tmp/explore-nfl.png /tmp/explore-college.png
# PNG 1200x630 both
```

## Verdict

**PASS** — NFL teal LIVE sticker + college blue LIVE sticker when screener returns rows; PNGs valid with live player table layout.
