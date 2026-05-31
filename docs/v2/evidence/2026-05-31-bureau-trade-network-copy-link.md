# Evidence — Bureau Trade Network copy link (2026-05-31)

**Slice:** `bureau-trade-network-copy-link`  
**Atom:** 4/5 — League L5 Bureau behavioral share parity epic

## Gate C — OG export (unchanged route, regression check)

```bash
curl -s -o /tmp/trade-network-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/trade-network?league=demo&download=1"
file /tmp/trade-network-og.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 68199 bytes |
| Type | PNG 1200×630 |

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → OK

## UI change

- `BureauTradeNetwork` footer: `copy link` + `export card` on same row (matches Pressure Map / Manager Profiles).

**Verdict:** PASS
