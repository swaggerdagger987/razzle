# Evidence — Bureau H2H OG terracotta watermark band (2026-05-31)

**Atom:** `lab-og-watermark-band-head-to-head`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/head-to-head?download=1` | 200 | 67846 | PNG 1200×630, terracotta band on preview + export |

```bash
curl -s -o /tmp/og-h2h.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
file /tmp/og-h2h.png
```

## Product

- H2H OG footer now matches Explore + Lab panel OG: always-on `#d97757` watermark band with league path + Caveat export tag.
- Atlas Room hallway link preserved above the band when rivalry data is present.
