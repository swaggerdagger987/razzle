# Evidence — Bureau H2H Atlas room hallway (2026-05-31)

**Slice:** `bureau-h2h-room-hallway` — H2H export footer + ShareBar Atlas deep-link with opponent team name.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/h2h-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1'
# 200 71895
file /tmp/h2h-og.png  # PNG 1200x630
```

## Verdict

PASS — OG footer shows `razzle.lol/room?agent=atlas&...` with opponent team label; ShareBar mirrors in-panel `ask Atlas about {team}` link via `@razzle/hallway` `toRoom`.

## Trust

T5 (export fidelity), T6 (hallway cross-room link on export card).
