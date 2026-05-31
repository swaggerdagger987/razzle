# Evidence — Lab OG efficiency PPO-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-efficiency-ppo-ranked`  
**Route:** `/og/efficiency?download=1`

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
JWT_SECRET=test pytest apps/api/tests -q    # 51 passed
curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/efficiency?download=1'
# 200 59068
file /tmp/og-efficiency.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — OG PNG ≥40KB with live demo rows; `EfficiencyRenderer` sorts by PPO (or formula score) before `ogSnapshotRows` encode.
