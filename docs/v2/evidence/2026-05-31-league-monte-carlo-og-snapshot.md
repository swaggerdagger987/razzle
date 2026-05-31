# Evidence — League L5 Monte Carlo OG snapshot (2026-05-31)

**Atom:** `league-monte-carlo-og-snapshot` (epic 2/3)

```bash
# snapshot encodes top-3 odds rows from Bureau panel
curl -s -o /tmp/mc-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/monte-carlo?download=1&snapshot=<encoded>'
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 53487 bytes |
| Type | PNG 1200×630 |

web build PASS.

**Verdict:** PASS
