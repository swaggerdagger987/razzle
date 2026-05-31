# Evidence — lab-og-tolab-snapshot-player

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-snapshot-player`  
**Cycle:** factory cycle 1 (good morning)

## Verification

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest` | 4 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/gamelog?download=1&player_id=00-0036900&snapshot=<base64url>` | `200 53120` PNG 1200×630 |

## Code claim

`labOgWatermarkLink` accepts `isSnapshot`; when true and panel is player-scoped, `toLab()` always includes `player_id` (including default Ja'Marr on FROM PANEL snapshot exports).

## Verdict

**PASS** — FACTORY-DOD Gate C candidate. Snapshot gamelog exports preserve hallway player context in terracotta watermark band.
