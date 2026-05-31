# Evidence — league-h2h-og-toleague-watermark

**Date:** 2026-05-31  
**Atom:** `league-h2h-og-toleague-watermark` — H2H OG terracotta band uses `toLeague()` with `user` + `opponent` query params.

## Gate C

```bash
curl -s -o /tmp/og-h2h.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/head-to-head?download=1"
200 75614
file /tmp/og-h2h.png
# PNG image data, 1200 x 630
```

PNG ≥ 40KB with demo rivalry rows — PASS candidate.

## Tests

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_league_h2h_og_toleague_watermark.py apps/api/tests/test_bureau_h2h_og_snapshot_codec.py -q --noconftest
7 passed

npm run build --workspace=apps/web — exit 0
```

**Verdict:** PASS
