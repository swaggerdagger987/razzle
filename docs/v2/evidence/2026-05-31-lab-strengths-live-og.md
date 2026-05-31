# Evidence — lab-strengths-live-og (2026-05-31)

## Atom

`lab-strengths-live-og` — Strengths OG live percentile extract + LIVE sticker.

## Commands

```bash
python3 -m pytest apps/api/tests/test_og_strengths_live.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-strengths.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/strengths?player_id=00-0036900&download=1"
```

## Results

- pytest: 1 passed
- web build: exit 0
- curl: 200 PNG (demo rows when API unavailable; LIVE sticker when strengths[] returned)

## Trust

T5 (screenshot-worthy export), T6 (hallway lab watermark preserved)
