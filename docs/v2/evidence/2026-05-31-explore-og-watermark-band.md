# Evidence — explore-og-watermark-band (factory workday cycle 1)

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/explore?download=1` | `200 40276` bytes PNG |
| Watermark | diagonal `razzle.lol` band at 14% terracotta opacity on download cards |

**Verdict:** PASS
