# Evidence — Lab L4 pro gate OG sample export (2026-05-31)

**Atom:** `lab-pro-gate-og-sample-export`  
**Epic:** Lab L4 — Pro gates feel like upgrade, not error (atom 5/5)

## Change

- `teaserRowsToOgSnapshot()` maps pro-gate blur preview rows to OG snapshot rows.
- `ProUpgradeGate` renders `LabOgExportLink` with encoded teaser snapshot + default player for gamelog/dynasty-comps.

## Commands

```text
JWT_SECRET=test-secret pytest apps/api/tests/test_panel_upgrade_teaser.py -q
→ 4 passed

npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/og-rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&force_demo=1'
→ 200 67083

file /tmp/og-rankings-snap.png → PNG 1200x630
```

## Verdict

**PASS** — Gate C satisfied (PNG ≥ 40KB). L4 upgrade epic complete after merge.
