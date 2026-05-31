# League Build Profiles share OG — 2026-05-31

**Atom:** `league-build-profiles-share-og`  
**Slice:** Build Profiles copy link + OG export card (epic atom 1/3)

## Change

- `BureauBuildProfilesShareBar` — copy profiles link + export card button.
- `/og/build-profiles` — Atlas-branded OG card with demo archetype rows (Win Now, Zero RB, Hero RB, etc.).

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-build-profiles.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/build-profiles?league=demo&download=1'
# 200 72409

file /tmp/og-build-profiles.png
# PNG 1200x630
```

## Gate C

PASS — PNG 72409B ≥ 40KB with demo fallback rows showing team + archetype + reasoning.
