# Evidence — lab-player-scoped-og-watermark (2026-05-31)

**Atom:** Player-scoped Lab OG watermark — `toLab` + `toRoom` with API player name.

## Tests

```
pytest apps/api/tests/test_og_player_scoped_watermark.py apps/api/tests/test_lab_og_tolab_watermark.py -q → 12 passed
npm run typecheck --workspace=apps/web → exit 0
```

## Gate C

```bash
curl -s -o /tmp/og-strengths.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/strengths?player_id=00-0036900&download=1"
```

Prior run: `200 80762` PNG.

**Verdict:** PASS
