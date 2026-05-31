# Evidence — lab-tradevalues-og-snapshot (2026-05-31)

## Slice

Trade Values Lab panel passes `snapshotRows` (top-6 by dynasty value or formula score) to `LabOgExportLink`.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## OG curl (Gate C)

```bash
curl -s -o /tmp/og-tradevalues.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=<encoded>"
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 62396 bytes (≥ 40KB) |
| Route | `/og/tradevalues?snapshot=...` |

## Verdict

**PASS** — snapshot param renders full PNG with trade-value bar rows (Value stat + team).
