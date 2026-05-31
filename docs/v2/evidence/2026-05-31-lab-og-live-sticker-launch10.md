# Evidence — lab-og-live-sticker-launch10

**Date:** 2026-05-31  
**Route:** `/og/rankings?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' 'http://127.0.0.1:3000/og/rankings?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl rankings OG | `200 62355` |
| PNG | 1200×630, ≥40KB |

## Notes

- Teal Caveat `LIVE · nflverse rows` sticker renders when `showingLiveData` on Launch-10 slugs.
- Blurb suffix adds `· live nflverse rows` for same path (was silent).
- Dedup: H2H watermark atom merged on base via PR #666 (`44d05684`) — not rebuilt this cycle.
