# Evidence — Bureau Monte Carlo copy link (2026-05-31)

**Slice:** League L5 — Monte Carlo copy link beside export card  
**Atom:** `bureau-monte-carlo-copy-link`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-mc.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/monte-carlo?league=demo&user=demo&download=1'
file /tmp/og-mc.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | PASS (exit 0) |
| API tests | PASS (51 passed) |
| OG monte-carlo | **200 53923** bytes PNG 1200×630 |

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB).
