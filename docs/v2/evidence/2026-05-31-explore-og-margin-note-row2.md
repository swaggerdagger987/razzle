# Evidence — Explore OG row-2 margin note

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-row2`  
**Epic:** Explore L5 — OG screener agent margin notes (2/4)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_og_margin_note_row2.py -q --noconftest
curl -s -o /tmp/og-explore.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/explore?download=1&force_demo=1"
```

## Results

| Check | Output |
|-------|--------|
| pytest | 4 passed |
| curl | `200 67971` PNG 1200×630 |

## Verdict

**PASS** — Row 2 (Ja'Marr Chase, 128 targets) shows Hawkeye "heavy target volume" on OG card; lead row youth breakout unchanged.
