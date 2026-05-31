# Evidence — Lab OG gamelog live week extract (2026-05-31)

**Atom:** `lab-og-gamelog-live-week-extract`  
**Epic:** Lab L5 — Launch-10 OG live panel row extractors (atom 2/3)

## Changes

- `extractGamelogWeekRows` — maps `weeks[]` from `/api/game-log` to `Wk N` / PPR rows (matches `GamelogRenderer` snapshot encoding)
- `extractRows` — gamelog slug short-circuits before generic `candidates` path

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret PYTHONPATH=/workspace python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/gamelog-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?player_id=00-0036900&download=1'
# 200 61129
file /tmp/gamelog-og.png  # PNG 1200x630
```

## Gate C

PNG ≥ 40KB with row layout. CI has no `terminal.db`; demo fallback unchanged when API 500. Live week path activates when `weeks[]` is present (same shape as in-panel export).

## Trust

T5 (export fidelity), T6 (screenshot-ready week tape on OG).
