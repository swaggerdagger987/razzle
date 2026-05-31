# Evidence — lab-og-tolab-strengths-default (2026-05-31)

**Atom:** `lab-og-tolab-strengths-default`  
**Epic:** Lab L5 — pro panel OG toLab hallway (atom 1/3)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-strengths.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/strengths?download=1&player_id=00-0036900"
# 200 66024
file /tmp/og-strengths.png
# PNG 1200x630
```

## Claim

Strengths player-scoped OG export includes default `player_id` in `TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS`,
so the watermark band links to `/lab/strengths?id=00-0036900` (T6 hallway).
