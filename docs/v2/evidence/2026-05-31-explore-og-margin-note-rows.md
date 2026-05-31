# Evidence — Explore OG top-3 margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-rows`  
**Epic:** Explore L5 — OG screener agent margin notes (2/4)

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_og_margin_note_rows.py apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 7 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og-rows.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/explore?force_demo=1&download=1'
# 200 ≥40KB
```

## Change

`topMarginNotes` renders Hawkeye/Dolphin margin lines on OG rows #1–#3 (demo: youth breakout,
heavy targets, peak window closing).

## Verdict

PASS — FACTORY-DOD Gate C.
