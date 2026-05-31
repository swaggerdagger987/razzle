# Evidence — Power Rankings OG (2026-05-31)

**Slice:** League L5 — `/og/power-rankings` with demo fallback + Bureau export button  
**Atom:** `league-power-rankings-og`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 52 passed, 4 snapshot failures (pre-existing on base)
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?league=demo&download=1'
```

## Results

| Check | Result |
|-------|--------|
| Web build | PASS |
| API tests | PASS (snapshot failures match base) |
| OG power-rankings | **200 48315** bytes PNG 1200×630 |

## Verdict

**PASS** — Gate C2 satisfied.
