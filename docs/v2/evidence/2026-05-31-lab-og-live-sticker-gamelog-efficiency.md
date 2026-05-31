# Evidence — lab-og-live-sticker-gamelog-efficiency

**Cycle:** 129 | **Date:** 2026-05-31

## Gate C — OG PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1&player_id=` | 200 | 60634 | PASS |
| `/og/efficiency?download=1&force_demo=1` | 200 | 65762 | PASS |

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `python3 -m pytest apps/api/tests/test_lab_og_live_sticker_gamelog_efficiency.py -q --noconftest` — 2 passed
