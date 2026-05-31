# Evidence — bureau-self-scout-sharebar-extract

**Date:** 2026-05-31  
**Atom:** `bureau-self-scout-sharebar-extract`  
**Layer:** League L5

## Claim

Self-Scout copy/export row lives in `BureauSelfScoutShareBar`, mirroring `BureauH2HShareBar` with snapshot-encoded OG export.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/self-scout-share.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1'
file /tmp/self-scout-share.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | PASS (exit 0) |
| OG demo PNG | `200 66997` bytes |
| PNG type | PNG 1200×630 |

## Verdict

**PASS** — Gate C satisfied (≥40KB PNG with demo depth grade rows).
