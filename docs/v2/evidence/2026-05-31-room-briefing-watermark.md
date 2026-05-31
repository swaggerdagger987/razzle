# Evidence — room-briefing-watermark (2026-05-31)

## Slice

Briefing OG terracotta watermark band uses `toRoom` hallway deep link (`razzle.lol${roomPath}`).

## Dedup note

Implementation landed on `origin/razzle-v2-redesign` at `e1eb68fe8` during parallel factory run; this cycle records standup + factory open state.

## Commands

```bash
python3 -m pytest apps/api/tests/test_briefing_og_route.py -q --noconftest
# 5 passed on merged base

curl -s -o /tmp/briefing-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/briefing?download=1"
# 200 89235 (local dev verify)
```

## Verdict

PASS — Gate C satisfied.
