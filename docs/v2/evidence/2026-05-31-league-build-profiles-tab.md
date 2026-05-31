# Evidence — League Build Profiles Tab (2026-05-31)

**Slice:** `league-build-profiles-tab` — Unhide Build Profiles tab with Atlas renderer  
**Cycle:** 82 (workday cycle 1)  
**Verdict:** PASS

## Acceptance commands

### Web build

```
npm run build --workspace=apps/web
```

Exit 0. Route `/league/[id]/build-profiles` compiles; `build-profiles` removed from `HIDDEN_BUREAU_SLUGS`.

### API tests

```
JWT_SECRET=test python3 -m pytest apps/api/tests -q
```

```
51 passed, 5 skipped, 2 warnings in 1.81s
```

## UI verification

- `BureauBuildProfiles.tsx` — Atlas header, archetype badges (Hero RB, Zero RB, etc.), league-dominant style callout, per-team reasoning cards, Room + self-scout/manager-profiles hallway links.
- `bureau-features.ts` — `build-profiles` unhidden from nav + route gate.
- `BureauFeatureBody.tsx` — wired renderer.

No OG gate this atom (tab renderer only).

## Trust pillars

T2 (hallway links to Room + Bureau tabs), T5 (Atlas domain ownership per registry), T6 (screenshot-ready build archetype grid).
