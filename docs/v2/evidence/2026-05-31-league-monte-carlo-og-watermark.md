# Evidence — league-monte-carlo-og-watermark

**Atom:** `league-monte-carlo-og-watermark`  
**Epic:** League L5 — Bureau Monte Carlo GTM export (atom 1/3)

## Commands

```text
JWT_SECRET=test-secret pytest apps/api/tests/test_monte_carlo_og_watermark.py -q
→ 1 passed

npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/og-mc.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1'
→ 200 58431

file /tmp/og-mc.png → PNG 1200x630
```

## Change

- Terracotta always-on watermark band with `toLeague(league, "monte-carlo")`.
- LIVE / SAMPLE / EXPORTED stickers aligned with Trade Finder OG.
- `resolveApiOrigin` for same-origin Bureau API in edge OG.

## Verdict

**PASS** — Gate C satisfied (PNG ≥ 40KB).
