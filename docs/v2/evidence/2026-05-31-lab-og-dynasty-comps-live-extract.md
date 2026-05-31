# Evidence — Lab OG dynasty comps live extract (2026-05-31)

**Atom:** `lab-og-dynasty-comps-live-extract`  
**Epic:** Lab L5 — Launch-10 OG live panel row extractors (atom 3/3 — epic complete)

## Changes

- `extractDynastyCompsRows` — sorts `comps[]` by similarity % (matches `DynastyCompsRenderer`)
- `extractRows` — dynasty-comps slug short-circuits before generic candidates

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret PYTHONPATH=/workspace python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/comps-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dynasty-comps?player_id=00-0036900&download=1'
file /tmp/comps-og.png
```

## Trust

T5, T6
