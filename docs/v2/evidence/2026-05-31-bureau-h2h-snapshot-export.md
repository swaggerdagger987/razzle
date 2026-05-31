# Evidence — Bureau H2H OG snapshot export encoding

**Date:** 2026-05-31  
**Atom:** `bureau-h2h-snapshot-export`  
**Slice:** H2H export encodes in-product you/them/position bars in OG `snapshot` param

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-h2h.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/head-to-head?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | PASS |
| pytest | 51 passed, 5 skipped |
| OG H2H PNG (no snapshot) | `200 59305` bytes, PNG 1200×630 |

## Implementation

- `encodeBureauH2HOgSnapshot()` in `apps/web/lib/bureau-h2h-og-snapshot.ts`
- `BureauH2HShareBar` adds `snapshot` query param when `ogSnapshot` provided
- `BureauHeadToHead` passes live you/them/position_compare/trade_fit into export link

## Follow-up

Atom `bureau-h2h-og-snapshot-decode`: OG route should prefer `snapshot` param over API refetch.

## Verdict

PASS — Gate C satisfied for baseline OG route; snapshot param present on in-product export href.
