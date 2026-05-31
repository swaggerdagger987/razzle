# Evidence — Explore OG top-3 margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-rows`  
**Epic:** Explore L5 — OG screener agent margin notes (2/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_rows.py apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 8 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 73163 — PNG 1200×630
```

## Verdict

**PASS** — Ranks 1–3 render per-row Hawkeye/Dolphin margin notes (Caveat + agent emoji) via `TOP_MARGIN_NOTE_ROWS`; demo rows tuned for youth breakout + target volume; curl 73163B.
