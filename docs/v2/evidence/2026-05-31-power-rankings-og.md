# Evidence — Power Rankings OG share card

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og`

## Change

- New `/og/power-rankings` route with Octo header, differential bars, luck tags.
- Demo fallback rows when league API unavailable (Gate C3 static demo).

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=demo'
# 200 66584
file /tmp/og-pr.png  # PNG 1200x630
```

## Verdict

PASS — Gate C2 power-rankings OG ≥40KB with demo rows visible.
