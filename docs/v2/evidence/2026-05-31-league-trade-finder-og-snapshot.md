# Evidence — league-trade-finder-og-snapshot

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-og-snapshot`  
**Cycle:** 146 (workday cycle 1 — good morning)

## Change

Trade Finder export encodes in-panel matches via `snapshot` query param; OG shows FROM PANEL sticker.

## Verification

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest test_trade_finder_og_watermark.py` | 1 passed |
| `curl .../og/trade-finder?...&snapshot=<demo>` | `200 50869` PNG |

## Verdict

**PASS** — FACTORY-DOD Gate C.
