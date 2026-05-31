# Evidence — lab-og-live-sticker-breakouts-dashboard

**Atom:** `lab-og-live-sticker-breakouts-dashboard`  
**Pillar:** Lab L5  
**Trust:** T5, T6

## Change

- Pytest asserts `LIVE · breakout board` and `LIVE · roster grades` stickers + blurb suffixes in OG route (labels shipped in atom 1).

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_live_sticker.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dashboard?download=1'
```

## Results

| Route | curl |
|-------|------|
| `/og/breakouts?download=1` | `200 67621` |
| `/og/dashboard?download=1` | `200 67113` |

**Verdict:** PASS
