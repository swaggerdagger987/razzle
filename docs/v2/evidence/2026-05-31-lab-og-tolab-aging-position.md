# Evidence — lab-og-tolab-aging-position

**Date:** 2026-05-31  
**Verdict:** PASS

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 12 passed

npm run build --workspace=apps/web
# exit 0
```

`TOLAB_DEFAULT_POSITION.aging = "RB"` — export watermark links to `/lab/aging?position=RB`.
