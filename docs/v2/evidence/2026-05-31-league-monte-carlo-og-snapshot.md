# Evidence — league-monte-carlo-og-snapshot

**Date:** 2026-05-31  
**Atom:** Monte Carlo export encodes playoff odds grid snapshot  
**Verdict:** PASS (Gate C2)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-mc.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1&league=demo&user=demo&snapshot=eyJyIjpbeyJtIjoiRHluYXN0eSBCdWtlcyIsImNwIjoyOCwicHAiOjkxLCJycCI6OTR9LHsibSI6IlJlYnVpbGQgRkMiLCJjcCI6MTkscHAiOjc4LCJycCI6ODZ9LHsibSI6IllvdXIgU3F1YWQiLCJjcCI6MTQscHAiOjYyLCJycCI6ODF9XX0'
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 53923 bytes (≥40KB) |
| file(1) | PNG 1200×630 |

## Change

`BureauMonteCarloShareBar` encodes top-3 odds via `encodeBureauMonteCarloOgSnapshot`; `/og/monte-carlo` decodes `snapshot` before live API fallback.
