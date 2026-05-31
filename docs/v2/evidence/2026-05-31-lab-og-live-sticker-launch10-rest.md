# Evidence — lab-og-live-sticker-launch10-rest

**Atom:** `lab-og-live-sticker-launch10-rest`  
**Pillar:** Lab L5  
**Trust:** T5, T6

## Change

- `launch10LiveStickerLabel` + `launch10LiveBlurbSuffix` name the stat per Launch-10 slug (not generic nflverse rows).

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_live_sticker.py -q
npm run build --workspace=apps/web
# Gate C (dev server):
# curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
#   'http://127.0.0.1:3000/og/rankings?download=1'
# curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' \
#   'http://127.0.0.1:3000/og/gamelog?download=1'
```

## Results

| Route | curl |
|-------|------|
| `/og/rankings?download=1` | `200 67083` (verified cycle 129) |
| `/og/gamelog?download=1` | `200 60634` (verified cycle 129) |

**Verdict:** PASS
