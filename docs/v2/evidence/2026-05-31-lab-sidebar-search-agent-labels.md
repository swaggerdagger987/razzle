# Evidence — Lab sidebar search agent labels

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-search-agent-labels`  
**Cycle:** 123

## Changes

- `LabSidebar.tsx` — when sidebar search is active, each result shows `Panel title · Agent name` so Hawkeye/Octo/Bones ownership is visible without opening the panel.

## Commands

```text
npm run build --workspace=apps/web  → exit 0

JWT_SECRET=test PYTHONPATH=/workspace python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q
→ 3 passed
```

## Gate C

N/A — no OG/export routes touched.

## Verdict

PASS — build + pytest green; search mode surfaces agent owner in visible label.
