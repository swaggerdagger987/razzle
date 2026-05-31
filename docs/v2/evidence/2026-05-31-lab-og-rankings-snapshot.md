# Evidence — Lab L5 rankings OG snapshot rows

**Date:** 2026-05-31  
**Slice:** Rankings export passes in-panel top-6 snapshot + live preview label  
**Verdict:** PASS

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-rankings-snap.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/rankings?download=1&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MSwic2wiOiJWYWx1ZSJ9XQ'
# 200 41658 — blurb includes "from your panel"
```
