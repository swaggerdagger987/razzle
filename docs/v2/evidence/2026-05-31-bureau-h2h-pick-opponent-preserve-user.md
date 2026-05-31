# Evidence — bureau-h2h-pick-opponent-preserve-user

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-pick-opponent-preserve-user`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests/test_bureau_h2h_rivalry_url.py -q
# 2 passed
```

## Contract

- `BureauHeadToHead.pickOpponent` sets `user=` from URL or `you.user_id` when changing opponent.
- `LeagueDashboard` H2H fetch honors `user` query param for shared rivalry links.

## Layer claim

League L5 — H2H export deep-links epic atom 3/3.
