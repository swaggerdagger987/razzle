# Evidence — Explore OG top-3 margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-rows`  
**Epic:** Explore L5 — OG screener agent margin notes (2/4)

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-explore-rows.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1'
# 200 72834
```

Demo rows #1–#3 show Hawkeye/Dolphin margin notes (youth breakout, heavy targets, peak window).

## Contract

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_rows.py -q --noconftest
# 2 passed
npm run build --workspace=apps/web
# exit 0
```

**PASS**
