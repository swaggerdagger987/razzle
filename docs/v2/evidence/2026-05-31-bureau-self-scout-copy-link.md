# Evidence — Bureau Self-Scout copy link (2026-05-31)

**Slice:** League L5 — Self-Scout copy link beside export card

```bash
curl -s -o /tmp/og-self-scout.png -w "%{http_code} %{size_download}\n" \
  'http://localhost:3000/og/self-scout?download=1'
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 66997 bytes |
| Format | PNG 1200×630 |

**Verdict:** PASS
