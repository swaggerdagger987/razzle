# Evidence — League L5 Waiver Tendencies OG watermark (2026-05-31)

**Atom:** `league-og-waiver-watermark`  
**Route:** `/og/waiver-tendencies`

## Acceptance

| Check | Result |
|-------|--------|
| pytest `test_waiver_tendencies_og_watermark.py` | 1 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/waiver-tendencies?download=1` | `200 74792` PNG |

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥ 40KB, terracotta watermark band + LIVE/SAMPLE stickers).
