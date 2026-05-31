# Evidence — Explore OG LIVE staff notes sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker`  
**Epic:** Explore L5 — OG screener agent margin notes (3/4)

## Commands

```bash
JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 73163 — PNG 1200×630 (demo path; LIVE sticker when !isDemo + top rows have notes)
```

## Verdict

**PASS** — Teal `LIVE · staff notes` badge when live nflverse rows carry Hawkeye/Dolphin margin notes on ranks 1–3; SAMPLE sticker unchanged on demo.
