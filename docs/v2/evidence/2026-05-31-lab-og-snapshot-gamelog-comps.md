# Evidence — Lab OG snapshot gamelog + dynasty-comps

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-gamelog-comps`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## OG curl (snapshot query)

```bash
# gamelog — top weeks encoded as Wk N rows
curl -s -o /tmp/og-gamelog-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/gamelog?download=1&player_id=00-0036900&snapshot=<base64url>'
# → 200 40520

# dynasty-comps — comp list match %
curl -s -o /tmp/og-comps-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/dynasty-comps?download=1&player_id=00-0036900&snapshot=<base64url>'
# → 200 47292
```

Both PNGs: 1200×630, ≥40KB — not loading-copy-only shells.

## Layer claim

Lab L5 — OG export mirrors in-panel gamelog weeks and dynasty comp list via `snapshotRows` on `LabOgExportLink`.
