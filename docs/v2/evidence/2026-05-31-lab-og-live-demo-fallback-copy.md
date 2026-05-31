# Evidence — Lab OG SAMPLE vs LIVE contrast (2026-05-31)

**Atom:** `lab-og-live-demo-fallback-copy`  
**Route:** `apps/web/app/og/[panel]/route.tsx`

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests -q` | 55 passed, 5 skipped |
| `curl .../og/rankings?download=1&force_demo=1` | `200 67083` PNG (re-verify 2026-05-31T08:25Z) |
| `curl .../og/weekly?download=1` | `200 70383` PNG (re-verify 2026-05-31T08:25Z) |

## Gate C

- Demo path: terracotta `SAMPLE · not live data` sticker + blurb `SAMPLE rows — not live nflverse`
- Live path: teal `LIVE · nflverse rows` unchanged
- `force_demo=1` query skips live fetch for factory verification

## Verdict

**PASS** — Launch-10 OG cards distinguish sample from live at a glance.
