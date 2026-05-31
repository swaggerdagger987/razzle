# Evidence — explore-og-margin-note-sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker` — LIVE staff sticker when OG rows carry margin notes  
**Epic:** Explore L5 — OG screener agent margin notes (atom 3/4)

## Change

- `exploreOgShowsStaffMarginNotes` returns true when live rows (not demo) have margin notes in ranks 1–3.
- Teal `LIVE · staff notes` badge beside title when live staff intel is on the card.

## Verification

```text
pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest  → 2 passed
pytest apps/api/tests/test_explore_og_margin_note_rows.py -q --noconftest     → 4 passed
npm run build --workspace=apps/web                                            → exit 0
curl /og/explore?download=1&force_demo=1                                      → 200 73163 PNG
```

**Reality:** PASS
