# Evidence — Explore OG LIVE staff margin sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker`  
**Epic:** Explore L5 — OG screener agent margin notes (3/4)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test-secret python3 -m pytest \
  apps/api/tests/test_explore_og_margin_note_sticker.py \
  apps/api/tests/test_explore_og_margin_note_rows.py -q --noconftest
# 7 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og-sticker.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?force_demo=1&download=1'
# 200 73163 — PNG 1200×630
```

## Change

When live screener rows carry Hawkeye/Dolphin margin notes on ranks 1–3, Explore OG shows a rotated teal Caveat **LIVE · staff margin notes** sticker (demo/sample paths excluded via `!isDemo`).

## Verdict

**PASS** — Gate C PNG ≥40KB; sticker gated on `hasStaffMarginNotes && !isDemo`.
