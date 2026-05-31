# Evidence — League L5 Bureau Build Profiles tab (2026-05-31)

| Check | Result |
|-------|--------|
| Atom | `league-build-profiles-tab` |
| Tab visible | `build-profiles` removed from `HIDDEN_BUREAU_SLUGS` |
| Renderer | `BureauBuildProfiles.tsx` — Atlas archetype cards + league-shape summary |
| Wire | `BureauFeatureBody.tsx` routes `build-profiles` → renderer |
| Build | `npm run build --workspace=apps/web` exit 0 |
| API tests | `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped |
| Gate C3 | In-product Bureau tab with live API row layout (no OG this atom) |
| Verdict | PASS |
