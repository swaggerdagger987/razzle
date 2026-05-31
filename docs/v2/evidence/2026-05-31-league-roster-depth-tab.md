# Evidence — league-roster-depth-tab (2026-05-31)

## Route

- `/league/[id]/roster-depth` — visible in Bureau nav (not in `HIDDEN_BUREAU_SLUGS`)

## Verification

```bash
npm run build --workspace=apps/web
# exit 0

JWT_SECRET=test python3 -m pytest apps/api/tests -q --ignore=apps/api/tests/test_screener_snapshot.py
# 52 passed

rg 'roster-depth' apps/web/lib/bureau-features.ts apps/web/components/league/BureauFeatureBody.tsx
# roster-depth not in HIDDEN set; BureauRosterDepth wired in feature body
```

## Verdict

PASS — League L5 Roster Depth tab unhidden with Dolphin A–F position grade grid and hallway links.
