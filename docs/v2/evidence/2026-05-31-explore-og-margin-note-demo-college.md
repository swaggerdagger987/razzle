# Evidence — Explore OG college demo campus margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-demo-college`  
**Trust:** T5, T6

## Gate C

```bash
curl -s -o /tmp/explore-college-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&force_demo=1&download=1"
# 200 71510
file /tmp/explore-college-og.png  # PNG 1200x630
```

Lead demo row (Cam Ward, `passing_yards: 4312`) drives `marginNoteForOgExploreRow` → Hawkeye
"volume passer — draft radar" on OG card when API empty or `force_demo=1`.

## Tests

```bash
JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_explore_og_margin_note_college_demo.py \
  apps/api/tests/test_explore_og_margin_note_lead.py -q
# 9 passed
```

**Verdict:** PASS
