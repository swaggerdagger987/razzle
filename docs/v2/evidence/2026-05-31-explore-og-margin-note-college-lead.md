# Evidence — Explore OG college lead-row margin note

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-college-lead`  
**Epic:** Explore L5 — OG screener agent margin notes (3/4)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_explore_og_margin_note_college_lead.py \
  apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 8 passed

curl -s -o /tmp/og-college-margin.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&download=1&force_demo=1'
# 200 74573
file /tmp/og-college-margin.png
# PNG 1200x630
```

## Verdict

**PASS** — College demo lead (Cam Ward, 4312 passing yards) guarded for Hawkeye campus volume-passer margin via shared `marginNoteForOgExploreRow`; college OG curl 74KB with `campus stats preview` subtitle.
