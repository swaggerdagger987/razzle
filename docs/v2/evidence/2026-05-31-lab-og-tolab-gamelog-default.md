# Evidence — lab-og-tolab-gamelog-default

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-gamelog-default` — default Ja'Marr player in toLab for gamelog + dynasty-comps OG watermark.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-gamelog-tolab.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
# 200 62232
file /tmp/og-gamelog-tolab.png
# PNG 1200x630
```

## Change

`TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS` keeps `DEFAULT_OG_PLAYER_ID` in `toLab()` for gamelog and
dynasty-comps; rankings-style panels still omit the generic default to avoid fake deep links.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB).
