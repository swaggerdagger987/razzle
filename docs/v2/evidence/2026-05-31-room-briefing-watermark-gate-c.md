# Evidence — Room briefing OG watermark Gate C (2026-05-31)

**Atom:** `room-briefing-watermark`  
**Epic:** Room L5 — briefing GTM export (atom 3/3 — epic complete)

## Acceptance

```text
python3 -m pytest apps/api/tests/test_briefing_og_route.py -q
→ 5 passed

curl -s -o /tmp/og-briefing.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/briefing?download=1'
→ 200 72168
```

## Change

- `test_briefing_og_route.py` — terracotta band + Room hallway link + Gate C fixture params.

## Gate C

PASS — PNG ≥40KB; route source asserts `#d97757` watermark band and `toRoom` hallway.

## Trust

T5 (shareable Room artifact), T6 (hallway link to `/room`).
