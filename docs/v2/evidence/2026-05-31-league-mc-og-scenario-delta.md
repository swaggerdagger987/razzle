# Evidence — league-mc-og-scenario-delta

**Date:** 2026-05-31  
**Atom:** `league-mc-og-scenario-delta`  
**Epic:** League L5 — Monte Carlo scenario GTM on OG export (atom 1/3)

## Acceptance

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_monte_carlo_scenario_og.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-mc-scenario.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1&snapshot=eyJyIjpbeyJpZCI6MSwibSI6IkR5bmFzdHkgRHVrZXMiLCJjcCI6MjgsInBwIjo5MSwicnAiOjk0fV0sInMiOnsiZyI6IkphJ21hcnIgQ2hhc2UiLCJuIjoiSmVmZmVyc29uIiwicCI6IlJlYnVpbGQgRkMiLCJkYyI6MTIuMywiZHAiOjguNSwiYmMiOjE0LCJzYyI6MTguMX19'
# 200 58294

file /tmp/og-mc-scenario.png
# PNG 1200x630
```

## Change

- `BureauMonteCarloOgSnapshot` optional `scenario` block (compact `s` in snapshot codec).
- `/og/monte-carlo` renders what-if trade delta (title + playoff shift) above odds rows when snapshot includes scenario.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB, scenario layout on card).
