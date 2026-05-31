# Evidence — Lab L5 OG position filter (rankings)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-rankings`  
**Verdict:** PASS

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/rankings?download=1&position=WR` | 200 | 50210 |

```bash
npm run typecheck --workspace=apps/web  # exit 0
npm run build --workspace=apps/web      # exit 0
curl -s -o /tmp/og-wr.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/rankings?download=1&position=WR'
```
