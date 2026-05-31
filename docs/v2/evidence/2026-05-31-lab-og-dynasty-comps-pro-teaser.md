# Evidence — lab-og-dynasty-comps-pro-teaser

**Date:** 2026-05-31  
**Atom:** Dynasty comps Pro gate panel-specific teaser rows  
**Route:** `/og/dynasty-comps?player_id=00-0036900`

## Gate C — curl

| Request | HTTP | Bytes | Verdict |
|---------|------|-------|---------|
| `?player_id=00-0036900&download=1` | 200 | 54807 | PASS ≥40KB |

## Build

- `npm run build --workspace=apps/web` — exit 0

## Change

OG demo fallback for dynasty-comps uses `teaserRowsForPanel` comp preview rows (Match %) — mirrors ProUpgradeGate blur preview.

## Dedup

- H2H watermark + gamelog FPTS atoms already on base; shipped atom 3/3 closes live-extract epic.
