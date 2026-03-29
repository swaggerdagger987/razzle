---
id: S3-103
severity: S3
confidence: LOW
category: design
source: DQ-011+014+016+040+061+063+067+068+136+457+484
status: OPEN
---

# Shadow and border consistency — 11 remaining issues not in existing tickets

## Problems

These are shadow/border inconsistencies NOT covered by S2-006 (box-shadow 3px/5px normalize) or S2-007 (blur shadows). They are individual element-level issues:

1. **Sitewide 2px/3px box-shadow** (DQ-011) — Some elements use 2px shadow at rest instead of 4px.
2. **lab.html hover shadow wrong size** (DQ-014) — Specific hover shadow deviates from 6px spec.
3. **Hero mascot drop-shadow hardcoded rgba** (DQ-016) — No dark mode flip.
4. **Standalone card hover stays at 4px** (DQ-040) — Should grow to 6px on hover.
5. **Watermark missing on ~43 pages** (DQ-061) — Implementation split: 32 pages have watermark, 43 don't.
6. **Agents hover lift undersized** (DQ-063) — 7+ hover states go to 4px instead of 6px.
7. **`.btn-pro-upgrade:hover` uses 5px shadow** (DQ-067) — Off-spec.
8. **Agent card drop-shadow 2px undersized** (DQ-068) — Should be 4px.
9. **Prompts `.use-btn` hover shadow only 2px** (DQ-136) — Should be 6px.
10. **Soft drop-shadows used instead of hard offset** (DQ-457) — `0 4px 8px rgba` pattern violates chunky aesthetic.
11. **league-intel.html 11 box-shadow instances 2px/3px offset** (DQ-484) — Should be 4px.

## Fix

Audit all box-shadow values. Standardize: rest=4px, hover=6px, no blur. Replace all `0 Xpx Ypx rgba` with `Xpx Xpx 0 var(--ink)`.

## Files

- `frontend/agents.html` — hover lift, card shadows
- `frontend/league-intel.html` — 11 shadow instances
- `frontend/index.html` — hero mascot shadow
- `frontend/prompts.html` — button hover shadow
- 43 standalone HTML files — missing watermark

## Acceptance Criteria

1. All card shadows use 4px 4px 0 at rest
2. All hover shadows use 6px 6px 0
3. No blur-style shadows on cards (zero for third value)
