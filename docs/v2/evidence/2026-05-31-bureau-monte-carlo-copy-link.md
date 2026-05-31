# Evidence — Bureau Monte Carlo copy link (2026-05-31)

**Slice:** League L5 — Monte Carlo copy link beside export card  
**Atom:** `bureau-monte-carlo-copy-link`

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-monte-carlo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/monte-carlo?download=1'
```

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 53350 bytes |
| file(1) | PNG 1200×630 |

## UI

`BureauMonteCarlo` — `copy link` button beside `export card` when Sleeper user present (mirrors `BureauSelfScout`).

**Verdict:** PASS
