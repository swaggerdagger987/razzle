# Evidence — lab-og-breakouts-hero-export

**Date:** 2026-05-31  
**Atom:** Breakouts `LabOgExportLink` passes hero `playerId` + `playerName` for snapshot pid + watermark display.

## Commands

```bash
python3 -m pytest apps/api/tests/test_lab_og_snapshot_hero_tolab.py -q --noconftest
# 2 passed
npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS
