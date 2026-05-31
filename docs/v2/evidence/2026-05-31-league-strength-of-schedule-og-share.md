# Evidence — league-strength-of-schedule-og-share

**Date:** 2026-05-31  
**Atom:** Schedule tab OG power verdict card  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-sos.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/strength-of-schedule?download=1&league=demo&user=demo'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/strength-of-schedule?download=1&league=demo&user=demo` | 200 | 57260 | valid 1200×630 |

## Change

- `BureauStrengthOfScheduleShareBar.tsx` — copy link + export card
- `BureauStrengthOfSchedule.tsx` — wire share bar when `user_id` present
- `apps/web/app/og/strength-of-schedule/route.tsx` — Octo verdict OG with demo fallback
