# Evidence — explore-in-product-margin-parity (cycle 156)

**Date:** 2026-05-31  
**Atom:** `explore-in-product-margin-parity`  
**Verdict:** PASS

## Claim

In-product Explore Staff column uses the same `marginNoteForOgExploreRow` helper as the OG export lead row.

## Commands

```bash
JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_explore_in_product_margin_parity.py \
  apps/api/tests/test_explore_og_margin_note_lead.py \
  apps/api/tests/test_explore_og_margin_note_college_demo.py -q
# 14 passed

npm run build --workspace=apps/web
# success
```

## Parity guards

- `ExploreMarginNote.tsx` imports `marginNoteForOgExploreRow` (not a forked heuristic).
- `ExploreTable` Staff column wires `ExploreMarginNote`.
- `marginNoteForOgExploreRow` delegates to `marginNoteForRow` in `margin-notes.ts`.
- NFL/college copy strings (`youth breakout tape`, `volume passer — draft radar`) live in one module.

## Gate C

No `apps/web/app/og/` edits this atom — OG curl not required. Prior atoms validated college/NFL OG PNG sizes.
