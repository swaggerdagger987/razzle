# Evidence — Bureau H2H copy link + export row

**Date:** 2026-05-31  
**Slice:** League L5 — Head-to-Head copy link beside export card  
**Atom:** `bureau-h2h-copy-link`

## Gate C — OG preview

| Check | Result |
|-------|--------|
| Route | `GET /og/head-to-head?download=1` |
| HTTP | 200 |
| PNG size | 59305 bytes (≥40KB) |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-h2h.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1'
# 200 59305
```

## In-product

- `BureauHeadToHead.tsx`: `copy link` + `export card` on same flex row (Self-Scout / Monte Carlo parity).

## Verdict

**PASS** — FACTORY-DOD Gate C2 satisfied with demo fallback OG card.
