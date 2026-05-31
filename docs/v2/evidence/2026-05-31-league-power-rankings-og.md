# Evidence — League L5 Power Rankings OG

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`  
**Route:** `/og/power-rankings`

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 68555 bytes |
| Dimensions | 1200×630 PNG |
| Demo rows | 5 teams with differential bars + luck tags when no league param |
| Sample label | Subtitle includes "sample preview" when demo |

```bash
curl -s -o /tmp/og-power-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1'
# 200 68555
file /tmp/og-power-rankings.png
# PNG image data, 1200 x 630
```

**Verdict:** PASS — FACTORY-DOD Gate C2/C3 satisfied.
