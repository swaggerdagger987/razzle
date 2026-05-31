# Evidence — Lab panel OG hallway footer (2026-05-31)

**Atom:** `lab-og-hallway-footer`  
**Epic:** Lab L5 — OG panel hallway exports (atom 1/3)

## Acceptance

```text
python3 -m pytest apps/api/tests/test_lab_og_hallway_footer.py -q --noconftest
→ 2 passed

npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1'
→ 200 66806
file /tmp/og-rankings.png → PNG 1200×630
```

## Change

- `apps/web/app/og/[panel]/route.tsx` — `toLab()` deep link in terracotta footer (`razzle.lol${labPath} · open in Lab`); player-scoped panels pass lead row into hallway query.
- `apps/api/tests/test_lab_og_hallway_footer.py` — contract guards.

## Gate C

PASS — PNG ≥40KB with demo/live dynasty rank rows.

## Trust

T5 (screenshot artifact), T6 (hallway back to Lab panel).
