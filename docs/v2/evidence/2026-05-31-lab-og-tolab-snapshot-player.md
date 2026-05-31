# Evidence — lab-og-tolab-snapshot-player (2026-05-31)

**Atom:** `lab-og-tolab-snapshot-player`  
**Epic:** Lab L5 — OG hallway deep links (atom 3/3)

## Acceptance

```text
python3 -m pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
→ 3 passed

npm run build --workspace=apps/web
→ exit 0

curl gamelog OG with snapshot + player_id
→ 200 52611 PNG 1200×630
```

## Change

`labOgWatermarkLink` passes `isSnapshot` so non-default `player_id` on snapshot exports
keeps the player in `toLab()` (T6 hallway).

## Gate C

PASS — snapshot gamelog PNG ≥40KB.

## Trust

T5, T6
