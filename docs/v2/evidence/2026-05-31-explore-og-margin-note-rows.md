# Evidence — explore-og-margin-note-rows

**Atom:** `explore-og-margin-note-rows`  
**Epic:** Explore L5 — OG screener agent margin notes (atom 2/4)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_og_margin_note_rows.py apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-explore.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1'
file /tmp/og-explore.png
```

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 67971 bytes |
| Format | PNG 1200×630 |

## Verdict

PASS — Explore OG now shows staff margin notes on each of the top-3 demo/live rows when `marginNoteForOgExploreRow` fires.
