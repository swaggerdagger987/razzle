# Evidence — lab-prospects-og-snapshot (2026-05-31)

## Slice

Prospects Lab panel passes `snapshotRows` (top-6 by RPS on visible board) to `LabOgExportLink`.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## OG curl (Gate C)

```bash
curl -s -o /tmp/og-prospects.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/prospects?download=1&snapshot=<encoded>"
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 60628 bytes (≥ 40KB) |
| Route | `/og/prospects?snapshot=...` |

## Verdict

**PASS** — snapshot param renders full PNG with prospect board rows (RPS + school).
