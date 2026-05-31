# Evidence — Explore OG college margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-college`  
**Epic:** Explore L5 — OG screener agent margin notes (4/4)

## Commands

```bash
JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests/test_explore_og_margin_note_college.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og-college.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&force_demo=1&download=1"
# 200 79069 — PNG 1200×630; college demo with Hawkeye margin notes on top-3
```

## Verdict

**PASS** — College OG uses `marginNoteForOgExploreRow(p, universe)` with campus demo rows tuned for Hawkeye heuristics; curl 79069B; margin epic complete after merge.
