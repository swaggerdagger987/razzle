# Evidence — Lab OG prospects RPS snapshot sort

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-snapshot`  
**File:** `apps/web/components/lab/renderers/ProspectsRenderer.tsx`

## Change

Prospects export encodes top-6 **RPS-sorted** leaders (not list order), uses **RPS** stat label, and passes **position** filter to OG — matches in-panel big board sort.

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&snapshot=W3sibiI6IlRyYXZpcyBIdW50ZXIiLCJwIjoiV1IiLCJ0IjoiQ09MIiwicyI6OTQuMCwic2wiOiJSUFMifSx7Im4iOiJDYW0gV2FyZCIsInAiOiJRQiIsInQiOiJNSUEiLCJzIjo5MS4wLCJzbCI6IlJQUyJ9XQ&position=WR'
# 200 45050
curl -s -o /tmp/og-prospects-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1'
# 200 58084
```

## Verdict

PASS — Gate C2 PNG ≥40KB; RPS leaders + position filter travel on export.
