# Evidence — Bureau Schedule OG power verdict card

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-og-share`  
**Verdict:** PASS

## Change

- `apps/web/app/og/strength-of-schedule/route.tsx`: Octo OG card with rank, PPG, opp avg, verdict + demo fallback.
- `BureauStrengthOfScheduleShareBar.tsx`: copy link + export card.
- `BureauStrengthOfSchedule.tsx`: wires share bar when `user_id` present.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/sos-og.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/strength-of-schedule?league=demo&user=demo&download=1'
# 200 64773
file /tmp/sos-og.png   # PNG 1200x630
```

## Gate C

Demo fallback shows Octo verdict + stat blocks — not loading-copy-only shell.
