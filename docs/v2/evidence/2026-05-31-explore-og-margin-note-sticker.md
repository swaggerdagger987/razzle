# Evidence — explore-og-margin-note-sticker

**Date:** 2026-05-31  
**Atom:** LIVE staff sticker when Explore OG rows carry margin notes  
**Verdict:** PASS

## Gate C — demo Explore OG (sticker hidden on demo)

```bash
curl -s -o /tmp/og-explore-sticker.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1'
# 200 ≥40KB — LIVE sticker only when !isDemo && margin notes present
```

## Contract guards

```bash
pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
# 1 passed
npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — LIVE · staff margin notes sticker when live rows qualify.
