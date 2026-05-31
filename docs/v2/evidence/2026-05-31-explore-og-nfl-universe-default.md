# Evidence — explore-og-nfl-universe-default (2026-05-31)

**Atom:** `explore-og-nfl-universe-default` — NFL share/OG URLs omit redundant `universe=nfl`  
**Cycle:** 137

## Acceptance

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_share_og_universe.py -q --noconftest
# 5 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-nfl.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?sort=fantasy_points_ppr&dir=desc&download=1&force_demo=1'
# 200 65431
```

## Reality

PASS — Gate C NFL OG ≥40KB without `universe` query param; college still sets `universe=college`.
