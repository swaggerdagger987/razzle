# Evidence — Lab L4 percentiles pro-teaser

**Date:** 2026-05-31  
**Atom:** `lab-l4-percentiles-pro-teaser`  
**Pillar:** Lab · **Layer:** L4

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `/api/panels/percentiles` (free tier) | HTTP **402** upgrade_required |

## Product

- `panel-upgrade-teaser.ts`: percentile-specific blur rows (96th/91st/88th pctl copy).
- `packages/agents/registry.ts`: Atlas owns `percentiles` + `strengths` lab panels.

## Reality

PASS — pro gate returns 402 with structured upgrade detail; web build green.
