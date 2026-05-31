# Evidence — Lab L4 pro-gate panel pitches (refine)

**Cycle:** 128  
**Atom:** `lab-pro-gate-panel-pitches` (dedup — base had `0b59daee`; this cycle refines copy)  
**Date:** 2026-05-31

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests/test_panel_upgrade_teaser.py -q` | 7 passed |

## Change summary

- `panel-upgrade-teaser.ts`: thread/screenshot-native `PITCH_BY_SLUG` for rankings, tradevalues, breakouts.
- `test_panel_upgrade_teaser.py`: `test_launch_panel_pitches_are_screenshot_native` plus base hallway perk guards.

## Gate C

N/A — no OG/export routes.

## Verdict

**PASS** — Launch-10 pro trio pitches refined after base dedup.
