# Evidence — Lab OG dynasty-comps Pro teaser rows

**Date:** 2026-05-31  
**Atom:** `lab-og-dynasty-comps-pro-teaser`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped

curl -s -o /tmp/og-dynasty-comps.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/dynasty-comps?download=1&player_id=00-0036900'
# → 200 55031

file /tmp/og-dynasty-comps.png  # PNG 1200x630
```

## Change

- `teaserOgRowsForPanel` in `panel-upgrade-teaser.ts` — OG demo rows match `ProUpgradeGate` teaser (Ja'Marr Chase + comp match %).
- `extractDynastyCompsRows` — live `comps[]` sorted by `similarity` desc, stat = Match %.

## Verdict

PASS — demo teaser parity + live extract; OG ≥40KB.
