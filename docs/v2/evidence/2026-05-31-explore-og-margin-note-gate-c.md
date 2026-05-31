# Evidence — Explore OG margin notes Gate C

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-gate-c`  
**Epic:** Explore L5 — OG screener agent margin notes (4/4 — complete)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_explore_og_margin_note_gate_c.py \
  apps/api/tests/test_explore_og_margin_note_lead.py \
  apps/api/tests/test_explore_og_margin_note_row2.py \
  apps/api/tests/test_explore_og_margin_note_college_lead.py -q --noconftest

PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_explore_og_margin_note_gate_c.py \
  apps/api/tests/test_explore_og_margin_note_lead.py \
  apps/api/tests/test_explore_og_margin_note_row2.py \
  apps/api/tests/test_explore_og_margin_note_college_lead.py -q --noconftest
# 18 passed

curl -s -o /tmp/og-explore-margin-nfl.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1'
# 200 67971

curl -s -o /tmp/og-explore-margin-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1&force_demo=1'
# 200 72088
```

## Verdict

**PASS** — Gate C contract documents NFL + college fixture params; margin epic pytest suite 18 passed; NFL OG 68KB + college OG 72KB PNG with Hawkeye notes on rows 1–2.
