# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player` — snapshot exports preserve player in OG toLab watermark.

## Commands

```bash
python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0

SNAPSHOT=$(node -e "const p={r:[{n:'Christian McCaffrey',p:'RB',t:'SF',s:24.5,sl:'Wk 12'}],pid:'00-0033280'}; console.log(Buffer.from(JSON.stringify(p)).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,''))")
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}' \
  "http://127.0.0.1:3000/og/gamelog?download=1&snapshot=${SNAPSHOT}"
# 200 54427
file /tmp/og-gamelog-snap.png
# PNG 1200x630
```

## Change

- `encodeOgSnapshot` wraps rows with optional `pid` when export has a resolved player id.
- OG route decodes `pid` and passes `snapshotPlayerId` into `labOgWatermarkLink` so snapshot-only share URLs deep-link back with player context.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB); hallway epic atom 3/3 complete.
