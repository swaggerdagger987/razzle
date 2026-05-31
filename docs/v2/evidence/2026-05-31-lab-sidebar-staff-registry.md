# Evidence — lab-sidebar-staff-registry

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-staff-registry` — catalog panels mapped to analyst desks via `labPanels`.

## Commands

```bash
PATH=$HOME/.local/bin:$PATH python3 -m pytest apps/api/tests/test_lab_sidebar_staff_registry.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0
```

## Change

Expanded `labPanels` on all six agents — 100/100 catalog slugs assigned; Razzle catch-all capped at 8 tool hubs.

## Verdict

PASS — no UI slice; registry + pytest contract only.
