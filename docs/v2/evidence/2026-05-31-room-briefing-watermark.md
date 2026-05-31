# Evidence — Room briefing OG watermark (2026-05-31)

**Atom:** `room-briefing-watermark`  
**Epic:** Room L5 — briefing GTM export (atom 3/3)

## Commands (executed)

```text
pytest apps/api/tests/test_briefing_og_route.py -q  → passed
npm run build --workspace=apps/web  → exit 0
curl -s -o /tmp/og-briefing.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/briefing?download=1'
→ 200 82808
file /tmp/og-briefing.png → PNG 1200×630
```

## Change

- LIVE/SAMPLE trust sticker on briefing OG card
- Watermark band deep-links `razzle.lol` + `toRoom()` path with continue CTA

## Verdict

PASS — Gate C2/C3; Room L5 briefing GTM epic complete after merge.
