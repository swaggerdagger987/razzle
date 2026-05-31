# Evidence — league-h2h-og-toleague-watermark

**Date:** 2026-05-31  
**Atom:** `league-h2h-og-toleague-watermark`  
**Cycle:** 157

## Gate C — OG PNG

```text
curl -s -o /tmp/og-h2h.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
→ 200 75614
file /tmp/og-h2h.png → PNG 1200×630
```

## Change

- `h2hOgWatermarkLink()` uses `@razzle/hallway` `toLeague(league, "head-to-head")` with `user` + `opponent` query params.
- Replaces hand-built `/league/${league}/head-to-head?...` paths in watermark band.

## Tests

```text
JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_league_h2h_og_toleague_watermark.py \
  apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q --noconftest
→ 7 passed
npm run build --workspace=apps/web → exit 0
```

## Verdict

**Reality: PASS** — typed hallway watermark; demo rows on card (Gate C).
