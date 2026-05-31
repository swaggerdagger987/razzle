# Evidence — lab-og-tolab-strengths-default (2026-05-31)

**Atom:** `lab-og-tolab-strengths-default`  
**Epic:** Lab L5 — pro panel OG toLab hallway (atom 1/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 8 passed

npm run build --workspace=apps/web
# exit 0 (CI)
```

## Claim

Strengths player-scoped OG export includes default `player_id` in `TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS`,
so the watermark band links to `/lab/strengths?id=00-0036900` (T6 hallway).
