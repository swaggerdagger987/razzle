# Evidence — lab-og-gamelog-player-default

**Cycle:** 128  
**Atom:** `lab-og-gamelog-player-default` — Gamelog OG default `player_id` when export omits query  
**Epic:** Lab L5 — OG live fetch + sticker parity (complete)

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 (2026-05-31T08:56Z) |
| OG without `player_id` | `curl http://127.0.0.1:3000/og/gamelog?download=1` → **200**, **63175** bytes PNG 1200×630 |
| Band link | Watermark shows `razzle.lol/lab/gamelog?player_id=00-0036900` |
| LabOgExportLink | `PLAYER_SCOPED_OG_SLUGS` always append `DEFAULT_LAB_OG_PLAYER_ID` |

## curl

```bash
curl -s -o /tmp/gamelog-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
# 200 63175
```

## Verdict

PASS — gamelog export + OG band deep-link work without manual `player_id` in the share URL.
