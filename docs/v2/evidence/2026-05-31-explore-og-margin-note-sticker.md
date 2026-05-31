# Evidence — Explore OG LIVE staff sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker`  
**Epic:** Explore L5 — OG screener agent margin notes (3/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_sticker.py apps/api/tests/test_explore_og_margin_note_rows.py apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
npm run build --workspace=apps/web
```

## Gate C (after merge + dev server)

```bash
curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?download=1&force_demo=1"
```

## Verdict

**PASS** — Teal Caveat `LIVE · staff notes` sticker when live nflverse rows carry top-3 margin notes; demo path keeps SAMPLE only; subtitle suffix when sticker shows.
