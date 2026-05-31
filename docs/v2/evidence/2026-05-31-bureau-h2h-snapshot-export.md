# Evidence — Bureau H2H snapshot export (2026-05-31)

## Slice

League L5 — `BureauOgExportLink` + H2H OG snapshot decode from in-panel rivalry.

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
curl http://localhost:3000/og/head-to-head?download=1  → 200 59305 bytes PNG
curl http://localhost:3000/og/head-to-head?download=1&snapshot=…  → 200 54444 bytes PNG
file /tmp/og-h2h-demo.png  → PNG 1200×630
```

## Notes

- Snapshot subtitle: `· from your panel` when `snapshot` param decodes.
- Demo fallback unchanged when no league params (`· sample preview`).
