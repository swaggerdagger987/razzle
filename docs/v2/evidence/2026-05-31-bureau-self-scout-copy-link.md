# Evidence — Bureau Self-Scout copy link (2026-05-31)

**Slice:** League L5 — Self-Scout copy link beside export card  
**Atom:** `bureau-self-scout-copy-link`

## Gate C — OG preview

```bash
curl -s -o /tmp/og-self-scout.png -w "%{http_code} %{size_download}\n" \
  'http://localhost:3000/og/self-scout?download=1'
file /tmp/og-self-scout.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 66997 bytes |
| Format | PNG 1200×630 |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## UI

- `BureauSelfScout.tsx`: `copy link` + `export card` on same row when `leagueId` + `userId` present (Explore/H2H parity).

**Verdict:** PASS
