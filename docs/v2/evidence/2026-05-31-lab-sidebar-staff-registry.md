# Evidence — lab-sidebar-staff-registry

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-staff-registry` — expanded `labPanels` in agent registry.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_sidebar_staff_registry.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — Gate 5; Staff sidebar groups more panels under specialist desks (H-04).
