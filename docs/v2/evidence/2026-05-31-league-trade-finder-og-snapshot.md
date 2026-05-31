# Evidence — league-trade-finder-og-snapshot

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-og-snapshot`  
**Room/Layer:** League L5

## Change

Trade Finder share bar encodes in-panel matches into `snapshot` query param; `/og/trade-finder` renders FROM PANEL sticker with exported trade rows.

## Verification (Reality Checker)

- `pytest apps/api/tests/test_trade_finder_og_watermark.py -q` — 2 passed
- `npm run build --workspace=apps/web` — exit 0
- `curl /og/trade-finder?download=1&snapshot=…` — HTTP 200, PNG 56711 bytes
- `curl /og/trade-finder?download=1` — HTTP 200, PNG 57910 bytes (demo fallback)
