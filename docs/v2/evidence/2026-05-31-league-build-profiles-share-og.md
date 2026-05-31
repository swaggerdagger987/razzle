# Evidence — League L5 Bureau Build Profiles share OG

**Date:** 2026-05-31  
**Slice:** `league-build-profiles-share-og`  
**Verdict:** PASS (Gate C2)

## Routes

- `/og/build-profiles?league=demo&download=1`
- In-product: `/league/{id}/build-profiles` + `BureauBuildProfilesShareBar`

## Curl (localhost:3000, post-merge verify)

```text
curl -s -o /tmp/build-profiles-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/build-profiles?league=demo&download=1'
200 72409
file /tmp/build-profiles-og.png
PNG image data, 1200 x 630
```

Demo fallback rows (Atlas archetypes) render when API unavailable — not loading-copy-only shell.

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
