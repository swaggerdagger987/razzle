# Evidence — Bureau H2H OG watermark band (2026-05-31)

**Atom:** `lab-og-watermark-band-head-to-head`  
**Epic:** Lab L5 — OG watermark band on Launch-10 cards (atom 2/2)

## Change

`apps/web/app/og/head-to-head/route.tsx` — replaced muted footer with always-on terracotta watermark band matching Explore + Lab panel OG routes.

## Commands (executed)

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/h2h-og.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/head-to-head?download=1'
```

## Results

| Route | Output |
|-------|--------|
| head-to-head (demo) | 200 67846 |

## Reality

PASS — Gate C (PNG ≥40KB; terracotta band visible on preview + download).
