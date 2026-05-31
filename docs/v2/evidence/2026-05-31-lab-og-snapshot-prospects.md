# Evidence — Lab L5 prospects OG snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-prospects` (epic 3/5)  
**Verdict:** PASS (Gate C2)

## Change

`ProspectsRenderer` passes `ogSnapshotRows` (top 6 ranked prospects: name, position, school as team, RPS) into `LabOgExportLink` with position filter.

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&position=WR&snapshot=eyJuIjoiVHJhdmlzIEh1bnRlciIsInAiOiJXUiIsInQiOiJDT0xPIiwicyI6OTQuMCwic2wiOiJSUFMifSx7Im4iOiJDYW0gV2FyZCIsInAiOiJRQiIsInQiOiJNSUFNIiwicyI6OTEuMCwic2wiOiJSUFMifSx7Im4iOiJBc2h0b24gSmVhbnR5IiwicCI6IlJCIiwidCI6IkJPSVNFIiwicyI6ODkuMCwic2wiOiJSUFMifV0'
```

## Result

- HTTP 200, **49000** bytes PNG (1200×630)
- Snapshot rows render on card (not demo-only when snapshot param present)
