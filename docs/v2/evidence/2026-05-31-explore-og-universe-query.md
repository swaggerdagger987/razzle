# Evidence — explore-og-universe-query (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Epic:** Lab L5 — OG live fetch + sticker parity (atom 2/4)

## Change

`ExploreShareButton` copies canonical `/explore?universe=…&sort=…` URLs (not `window.location.href`) so college shares and OG export always include `universe=college`.

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_share_og.py -q
# 3 passed

npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — Gate C N/A (OG route unchanged); copy + export query strings guarded by pytest.
