# Evidence — League L5 Build Profiles tab

**Date:** 2026-05-31  
**Atom:** `league-build-profiles-tab`  
**Verdict:** PASS

## Build

```text
npm run build --workspace=apps/web → exit 0
```

## API

```text
.venv-v2/bin/python -m pytest apps/api/tests -q → 51 passed, 5 skipped
```

## UI

- `build-profiles` removed from `HIDDEN_BUREAU_SLUGS`
- `BureauBuildProfiles` wired in `BureauFeatureBody` (Atlas header, archetype cards, hallway links)
- Dev smoke: `curl localhost:3000/pricing` → 200
