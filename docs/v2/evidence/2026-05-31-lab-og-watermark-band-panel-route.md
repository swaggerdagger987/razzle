# Evidence — Lab L5 OG watermark band (panel route)

**Date:** 2026-05-31  
**Atom:** `lab-og-watermark-band-panel-route`

## Change

`apps/web/app/og/[panel]/route.tsx` — replaced muted footer with always-on terracotta watermark band matching Explore OG (`#d97757`, Caveat tagline, export suffix on download).

## Commands (executed)

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/rankings?download=1'
curl -s -o /tmp/buysell-og.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/buysell?download=1'
```

## Results

| Route | Output |
|-------|--------|
| rankings | 200 62355 |
| buysell | 200 60820 |

## Reality

PASS — Gate C (PNG ≥40KB each).
