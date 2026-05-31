# Evidence — lab-og-live-sort-keys-fix (cycle 113)

**Date:** 2026-05-31  
**Atom:** `lab-og-buysell-dashboard-live-sort`  
**Change:** `PANEL_OG_STAT_KEY` — `efficiency_score`, `peak_age`, `value` (reverts merge regression ppo/ppg/dynasty_value)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl buysell → 200 58072
curl efficiency → 200 59068
curl aging → 200 57916
```

## Verdict

PASS — Gate C (PNG ≥40KB, 1200×630)
