# Evidence — Lab L5 dynasty rankings OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-dynasty-rankings-ranked`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1'
# 200 59509
```
