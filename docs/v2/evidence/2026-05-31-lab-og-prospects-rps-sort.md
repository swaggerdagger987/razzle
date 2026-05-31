# Evidence — Lab L5 prospects OG RPS sort

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-rps-sort`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&snapshot=<encoded>'
```

## Results

- Snapshot curl: **200**, **62577** bytes, PNG 1200×630

## Change

`ProspectsRenderer` sorts snapshot rows by RPS and passes `position` into `LabOgExportLink`.
