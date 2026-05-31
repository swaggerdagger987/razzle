# Evidence — Lab aging OG live extract (2026-05-31)

**Slice:** `lab-aging-og-live-extract` — OG route flattens `positions.{POS}.players` for aging-curves API  
**Epic:** Lab L5 — OG export matches in-panel position filters (atom 2/4)

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/aging?download=1&position=RB` |
| HTTP | 200 |
| PNG size | 44,952 bytes (≥40KB) |

```bash
curl -s -o /tmp/aging-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/aging?download=1&position=RB'
```

## Verdict

PASS — live aging players on OG without snapshot param.
