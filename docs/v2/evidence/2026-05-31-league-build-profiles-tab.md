# Evidence — league-build-profiles-tab — 2026-05-31

## Slice

Unhide Build Profiles Bureau tab with Atlas renderer (`BureauBuildProfiles.tsx`).

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
```

## UI claim

- `build-profiles` removed from `HIDDEN_BUREAU_SLUGS`
- Nav shows Build Profiles with Atlas avatar
- Feature body renders archetype board with reasoning rows

## Verdict

PASS — non-OG Bureau tab slice; Gate C N/A.
