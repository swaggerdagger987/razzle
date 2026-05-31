# Evidence — lab-og-tolab-strengths-default (2026-05-31)

**Atom:** `lab-og-tolab-strengths-default`  
**Cycle:** 154

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 6 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-strengths.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/strengths?download=1&player_id=00-0036900"
# 200 66024
```

## Claim

Strengths player-scoped OG watermark includes default `player_id` in `toLab()` via
`TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS`.
