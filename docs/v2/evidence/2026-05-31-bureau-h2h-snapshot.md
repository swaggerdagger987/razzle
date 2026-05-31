# Evidence — Bureau H2H snapshot export (2026-05-31)

**Slice:** League L5 — H2H OG export matches in-product rivalry via `snapshot` param  
**Route:** `/og/head-to-head`

## Curl (localhost:3000, dev server)

| Case | Command | Result |
|------|---------|--------|
| Demo fallback | `curl -s -o /tmp/h2h-demo.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/head-to-head?download=1'` | **200 59305** |
| Snapshot payload | `curl ... '&snapshot=eyJ5IjpbIkFscGhh...'` | **200 57079** |

Both responses: `file` → PNG 1200×630.

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB, rivalry layout with team cards + position bars).
