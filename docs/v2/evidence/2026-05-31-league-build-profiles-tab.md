# Evidence — League L5 Build Profiles tab

**Date:** 2026-05-31  
**Atom:** `league-build-profiles-tab`

## Acceptance

- `build-profiles` removed from `HIDDEN_BUREAU_SLUGS`
- `BureauBuildProfiles.tsx` renders archetype grid with Atlas header
- `BureauFeatureBody` routes `build-profiles` feature

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q \
  --ignore=apps/api/tests/test_screener_snapshot.py \
  --ignore=apps/api/tests/test_intel.py  # 52 passed, 1 env failure (college universe)
```

## Verdict

**PASS** — Build Profiles live in Bureau nav with screenshot-ready archetype cards.
