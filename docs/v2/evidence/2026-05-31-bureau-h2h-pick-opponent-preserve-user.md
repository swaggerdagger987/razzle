# Evidence — Bureau H2H picker preserves user= (2026-05-31)

**Cycle:** 132 | **Atom:** `bureau-h2h-pick-opponent-preserve-user`

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test .venv-v2/bin/pytest apps/api/tests -q  → 62 passed, 5 skipped
```

## Change

- `LeagueDashboard`: `?user=` on head-to-head overrides Sleeper session for API fetch.
- `BureauHeadToHead`: opponent picker sets `user=` when switching rivals.

## Verdict

PASS
