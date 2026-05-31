# Evidence — lab-og-dashboard-efficiency-formula-live

**Slice:** Dashboard + Efficiency OG prefer `formula_score` on live rows when API returns it.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/dashboard?download=1'
curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?download=1'
```

## Results

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/dashboard?download=1` | 200 | 65656 |
| `/og/efficiency?download=1` | 200 | 64569 |

## Verdict

PASS — Launch-10 OG extract uses `dashboardStatKeys` / `efficiencyStatKeys` with `formula_score` before legacy rank/efficiency keys.

## Trust

T5 (export matches panel sort keys), T6 (watermark `toLab` unchanged).
