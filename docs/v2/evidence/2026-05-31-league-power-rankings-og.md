# Evidence — league-power-rankings-og (2026-05-31)

## Route

- `GET /og/power-rankings?download=1`
- Bureau export link: `/og/power-rankings?league={id}&download=1`

## Curl (demo fallback, no league param)

```bash
curl -s -o /tmp/og-power-rankings.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/power-rankings?download=1"
# 200 66050
file /tmp/og-power-rankings.png
# PNG 1200x630
```

## Verdict

PASS — Gate C2/C3: PNG ≥40KB with static demo power board rows (#1–#4 teams, differential bars, luck tags).
