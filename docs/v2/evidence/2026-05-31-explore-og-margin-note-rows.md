# Evidence — Explore OG top-3 margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-rows`  
**Epic:** Explore L5 — OG screener agent margin notes (2/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_rows.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og-rows.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 72834 — PNG 1200×630
```

## Verdict

**PASS** — Rows 1–3 render Caveat margin lines (Hawkeye youth breakout, Hawkeye target volume, Dolphin peak window on demo NFL sample).
