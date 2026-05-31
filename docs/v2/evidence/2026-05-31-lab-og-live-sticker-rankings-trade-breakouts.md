# Evidence — lab-og-live-sticker-rankings-trade-breakouts

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-rankings-trade-breakouts`  
**Gate C:** OG PNG curl on merged preview path

## Acceptance

```text
npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/rankings?download=1'
# rankings: 200 67083

curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/tradevalues?download=1'
# tradevalues: 200 68974

curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' 'http://localhost:3000/og/breakouts?download=1'
# breakouts: 200 67621
```

All PNG ≥40KB. Sticker labels: dynasty tiers / trade curves / RBS board.

**Verdict:** PASS
