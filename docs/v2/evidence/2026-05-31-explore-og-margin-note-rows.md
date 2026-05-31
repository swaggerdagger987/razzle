# Evidence — explore-og-margin-note-rows

**Atom:** `explore-og-margin-note-rows`  
**Date:** 2026-05-31  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-explore.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1'
# 200 ≥40000 bytes
file /tmp/og-explore.png
# PNG 1200x630
```

## Contract

- `topMarginNotes` precomputes Hawkeye/Dolphin notes for rows 1–3 via `marginNoteForOgExploreRow`
- Each of top 3 rows renders Caveat agent emoji + note when present (demo: youth breakout, heavy targets, etc.)

## Tests

```bash
JWT_SECRET=test-secret pytest apps/api/tests/test_explore_og_margin_note_rows.py \
  apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 6 passed
npm run build --workspace=apps/web
# success
```
