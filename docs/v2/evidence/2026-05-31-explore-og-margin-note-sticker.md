# Evidence — Explore OG LIVE staff sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker`  
**Verdict:** PASS

## Route

- `GET /og/explore?force_demo=1&download=1`

## Curl

```text
HTTP 200
size_download: 73163
file: PNG image data, 1200 x 630
```

## Source checks

- `showStaffLiveSticker = !isDemo && hasStaffMarginNotes`
- Badge copy: `LIVE · staff notes` (teal `#2ec4b6`, Caveat)

## Tests

- `pytest apps/api/tests/test_explore_og_margin_note_sticker.py` — 3 passed
- `pytest apps/api/tests/test_explore_og_margin_note_rows.py` — 4 passed
- `npm run build --workspace=apps/web` — exit 0
