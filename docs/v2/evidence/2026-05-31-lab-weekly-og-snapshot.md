# Evidence — lab-weekly-og-snapshot (2026-05-31)

## Slice

Weekly heatmap OG snapshot uses top-6 **peak-week FPTS** (W{n} labels), not season PPG.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## OG curl (Gate C)

```bash
curl -s -o /tmp/og-weekly.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/weekly?download=1&snapshot=<encoded>"
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 47861 bytes (≥ 40KB) |
| Route | `/og/weekly?snapshot=...` |

## Verdict

**PASS** — snapshot renders full PNG; stat labels show peak week (W{n}).
