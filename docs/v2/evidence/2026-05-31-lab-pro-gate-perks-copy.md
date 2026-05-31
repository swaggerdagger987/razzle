# Evidence — lab-pro-gate-perks-copy

**Date:** 2026-05-31  
**Verdict:** PASS

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q  # 4 passed
```
