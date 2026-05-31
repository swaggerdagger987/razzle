# Evidence — Room GTM OG share bar (2026-05-31)

**Slice:** `room-gtm-og-share-bar` — `/og/room` staff grid card + `RoomShareBar` on Situation Room.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/og-room.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/room?agent=razzle&download=1'
file /tmp/og-room.png  # 200 61795
```

## Verdict

PASS — Room OG PNG ≥40KB; six-agent grid + terracotta watermark band.

## Trust

T5, T6
