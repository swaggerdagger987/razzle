# Evidence — Lab L5 breakouts OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-snapshot-breakouts`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## OG curl (snapshot query)

```bash
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&snapshot=<base64url>'
# → 200 45080
```

PNG: 1200×630, ≥40KB — in-panel RBS leaders encoded via `LabOgExportLink.snapshotRows`.

## Layer claim

Lab L5 — Breakouts export card mirrors Hawkeye board rows (name, position, RBS score).
