# Evidence — Explore OG lead-row margin note

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-lead`  
**Epic:** Explore L5 — OG screener agent margin notes (1/4)

## Commands

```bash
JWT_SECRET=test-secret pytest apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 65482 — PNG 1200×630
```

## Verdict

**PASS** — Contract tests green; web build OK; curl 65482B. Lead demo row (Jayden Daniels) carries Hawkeye youth-breakout margin note via `marginNoteForOgExploreRow` + agent emoji on OG card.
