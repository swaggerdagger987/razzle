# Evidence — Lab OG efficiency PPO-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-ppo-ranked`  
**Route:** `/og/efficiency?download=1`

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/efficiency?download=1'
# 200 59068
```

## Verdict

**PASS** — OG PNG ≥40KB; PPO-ranked top-6 before encode.
