# Evidence — League L5 Schedule OG export (2026-05-31)

## Slice

`league-strength-of-schedule-og-share` — Octo schedule verdict card + share bar on Bureau Schedule.

## Commands (executed)

```bash
pytest apps/api/tests -q
# 51 passed, 5 skipped

npm run build --workspace=apps/web
# exit 0; /og/strength-of-schedule route listed

cd apps/web && npx next start -p 3000
curl -s -o /tmp/og-strength-of-schedule.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/strength-of-schedule?league=demo&user=demo-user&download=1'
# 200 65992
```

## Files

- `apps/web/app/og/strength-of-schedule/route.tsx`
- `apps/web/components/league/BureauStrengthOfScheduleShareBar.tsx`
- `apps/web/components/league/BureauStrengthOfSchedule.tsx`

## Trust

T5 (export travels), T6 (voice — Octo even-slate verdict on card).
