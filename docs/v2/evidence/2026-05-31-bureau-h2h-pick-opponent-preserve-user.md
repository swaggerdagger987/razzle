# Evidence — Bureau H2H pick opponent preserves user (2026-05-31)

**Atom:** `bureau-h2h-pick-opponent-preserve-user`  
**Epic:** League L5 — Bureau H2H export deep-links (atom 3/3)

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 78 passed, 5 skipped
curl -s -o /tmp/h2h-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&league=demo&user=u1&opponent=u2'
→ 200 78250
file /tmp/h2h-og.png → PNG 1200×630
```

## Code change

- `LeagueDashboard` uses `?user=` from rivalry share URLs before Sleeper session user.
- `BureauHeadToHead.pickOpponent` keeps `user=` when switching opponents.

## Verdict

PASS — Gate C2/C3 regression; League L5 deep-link epic complete after merge.
