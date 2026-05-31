# Evidence — lab-efficiency-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-efficiency-empty-export`  
**Epic:** Lab L5 — OG export on empty panel states (atom 2/3)

## Acceptance

```text
PATH="$HOME/.local/bin:$PATH" python3 -m pytest apps/api/tests/test_lab_og_export_link.py -q --noconftest
→ 4 passed

npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/efficiency-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?download=1'
→ 200 64569
file /tmp/efficiency-og.png → PNG 1200×630
```

## Change

- `EfficiencyRenderer.tsx` — empty board footer exposes `export sample card` (OG demo fallback)
- `test_lab_og_export_link.py` — contract guard for empty-state export link

## Gate C

PASS — PNG ≥40KB with demo PPO rows.

## Trust

T5, T6
