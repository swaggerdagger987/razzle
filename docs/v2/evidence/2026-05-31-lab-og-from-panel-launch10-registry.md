# Evidence — lab-og-from-panel-launch10-registry

**Date:** 2026-05-31  
**Atom:** FROM PANEL pytest registry covers all Launch-10 slugs  
**Trust:** T5, T6

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py -q --noconftest
```

**Result:** 7 passed

## What shipped

- `LAUNCH_10_OG_TRUST_REGISTRY` maps all 10 `LAUNCH_10_OG_SLUGS` members to `from_panel_snapshot` or `live`.
- `SNAPSHOT_FROM_PANEL_SLUGS` derived from registry (rankings, weekly, prospects, tradevalues).
- `test_launch10_og_trust_registry_covers_all_route_slugs` parses route set and fails on drift.
- `test_live_registry_slugs_have_live_sticker_copy` guards live-channel slugs.

## Verdict

PASS — pytest-only atom; no OG route change this cycle.
