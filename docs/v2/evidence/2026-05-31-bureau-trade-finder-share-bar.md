# Evidence — Bureau Trade Finder share bar (2026-05-31)

**Slice:** League L5 — Trade Finder copy deal link + export card row  
**Atom:** `bureau-trade-finder-share-bar`

## Gate C — OG preview

```bash
curl -s -o /tmp/og-trade-finder.png -w "%{http_code} %{size_download}\n" \
  'http://localhost:3000/og/trade-finder?download=1'
file /tmp/og-trade-finder.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 57238 bytes |
| Format | PNG 1200×630 |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 52 passed, 4 failed (pre-existing snapshot/intel on VM without terminal.db; same on clean base)

## UI

- `BureauTradeFinderShareBar.tsx`: `copy deal link` + `export card` when Sleeper user present.

**Verdict:** PASS
