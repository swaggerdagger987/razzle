# Evidence — lab-og-from-panel-sticker-gamelog

**Cycle:** 134 | **Date:** 2026-05-31

## Gate C — gamelog snapshot export

```bash
# snapshot encodes two week rows (FROM PANEL sticker path)
curl -s -o /tmp/gamelog-snap-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=...'
# 200 43056 — PNG 1200×630
```

## Change

`GamelogRenderer` empty state prefetches default player gamelog weeks and passes `snapshotRows` to `LabOgExportLink` so `/og/gamelog` exports show the blue **FROM PANEL · your rows** sticker.

## Acceptance

- `npm run build --workspace=apps/web` — PASS
- `pytest apps/api/tests/test_lab_og_export_link.py` — PASS (3 tests)
