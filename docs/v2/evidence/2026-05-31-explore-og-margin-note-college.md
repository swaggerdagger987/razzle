# Evidence — Explore OG college campus margin notes

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-college`  
**Epic:** Explore L5 — OG screener agent margin notes (4/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_college.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-college.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&force_demo=1&download=1"
# 200 79756 — PNG 1200×630
```

## Verdict

**PASS** — College demo shows purple `SAMPLE · campus margin notes` when top-3 rows qualify; per-row Hawkeye campus copy via `marginNoteForOgExploreRow`; curl 79756B.
