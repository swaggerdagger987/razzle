# Evidence — Bureau Monte Carlo share bar

**Date:** 2026-05-31  
**Atom:** `bureau-monte-carlo-copy-link`

## Change

- `BureauMonteCarloShareBar` — copy sim link + export card (mirrors H2H share bar).
- Wired on `BureauMonteCarlo` when Sleeper user present; preserves scenario query params in copied URL.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-mc.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/monte-carlo?download=1&league=test&user=test'
# 200 53767
file /tmp/og-mc.png  # PNG 1200x630
```

## Verdict

PASS — Gate C2 monte-carlo OG ≥40KB.
