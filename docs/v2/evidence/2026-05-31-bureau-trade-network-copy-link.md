# Evidence — Trade Network copy link

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`

## Change

- `BureauTradeNetwork` footer — copy link button beside export card (mirrors Pressure Map pattern).

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-tn.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?league=demo&download=1'
# 200 68199
file /tmp/og-tn.png  # PNG 1200x630
```

## Verdict

PASS — Gate C2 trade-network OG ≥40KB; copy link wired on Bureau tab.
