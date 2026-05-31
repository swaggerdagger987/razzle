# Evidence — league-sos-og-snapshot (2026-05-31)

**Slice:** Bureau Schedule OG snapshot encode + ShareBar wiring  
**Route:** `/og/strength-of-schedule?download=1`

## Gate C

```bash
curl -s -o /tmp/og-sos.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/strength-of-schedule?download=1'
# 200 58624
```

**Verdict:** PASS — demo rows + snapshot decode on export path
