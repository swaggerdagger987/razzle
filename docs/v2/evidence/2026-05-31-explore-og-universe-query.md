# Evidence — explore-og-universe-query (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Epic:** Lab L5 — OG live fetch + sticker parity

## Acceptance

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_og_params.py -q
→ 2 passed

npm run build --workspace=apps/web
→ exit 0
```

## Gate C (curl)

```text
curl /og/explore?download=1&universe=college&sort=total_yards&dir=desc
→ 200 37393B

curl /og/explore?download=1&universe=nfl&sort=fantasy_points_ppr&dir=desc&pos=RB
→ 200 32650B (live rows; RB filter)
```

## Change summary

- `buildExploreOgSearchParams` always includes `universe` + college-safe sort for OG.
- `ExploreShareButton` copy link + preview/export use canonical params (not bare `window.location.href`).

## Verdict

PASS — college and NFL Explore exports preserve universe in share + OG URLs.
