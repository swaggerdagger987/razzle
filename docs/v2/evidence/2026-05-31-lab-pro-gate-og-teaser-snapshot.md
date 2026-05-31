# Evidence — Lab L4 Pro gate OG teaser snapshot

**Cycle:** 128  
**Slice:** `lab-pro-gate-og-teaser-snapshot`  
**Date:** 2026-05-31

## Acceptance

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q → 5 passed
```

## Gate C — OG PNG (teaser snapshot)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/rankings?download=1&snapshot=<teaser>` | 200 | 51200 | PNG 1200×630; Ja'Marr Chase / Bijan / Bowers from teaser rows |

```bash
curl -s -o /tmp/og-rankings-teaser.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1&snapshot=<encoded>"
file /tmp/og-rankings-teaser.png
```

## Change summary

- `teaserOgSnapshotRows()` maps Pro gate blur-preview rows to OG snapshot payload.
- `ProUpgradeGate` footer adds `LabOgExportLink` with matching snapshot.

## Verdict

PASS — build + pytest; OG PNG ≥40KB with teaser player names.
