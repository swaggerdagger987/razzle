# Evidence — Bureau H2H OG snapshot decode

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-og-snapshot-decode`  
**Slice:** H2H OG route prefers `snapshot` param over API refetch

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-h2h-base.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/head-to-head?download=1'
curl -s -o /tmp/og-h2h-snap.png -w '%{http_code} %{size_download}' \
  "http://localhost:3000/og/head-to-head?download=1&snapshot=<encoded>"
```

## Results

| Check | Result |
|-------|--------|
| web build | PASS |
| pytest | 51 passed, 5 skipped |
| OG H2H baseline | `200 59305` bytes |
| OG H2H with snapshot | `200 56871` bytes — shows Snap Squad vs Export FC (not demo) |

## Implementation

- `decodeBureauH2HOgSnapshot()` in `apps/web/lib/bureau-h2h-og-snapshot.ts`
- `/og/head-to-head` skips API when valid snapshot present; subtitle `· exported matchup`

## Verdict

PASS — Gate C; epic atom 3/3 complete.
