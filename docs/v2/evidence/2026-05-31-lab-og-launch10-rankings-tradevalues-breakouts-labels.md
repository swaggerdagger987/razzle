# Evidence — Launch-10 OG panel-native labels (rankings, tradevalues, breakouts)

**Atom:** `lab-og-launch10-rankings-tradevalues-breakouts-labels`  
**Cycle:** 129

## Acceptance

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q → 59 passed, 5 skipped
curl http://127.0.0.1:3000/og/rankings?download=1 → 200 66806 bytes PNG 1200×630
curl http://127.0.0.1:3000/og/tradevalues?download=1 → 200 67943 bytes
curl http://127.0.0.1:3000/og/breakouts?download=1 → 200 67800 bytes
```

## Verdict

PASS — Gate C ≥40KB PNGs; LIVE/SAMPLE stickers name dynasty ranks, trade values, breakout board.
