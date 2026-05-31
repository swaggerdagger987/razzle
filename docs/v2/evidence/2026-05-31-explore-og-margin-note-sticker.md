# Evidence — explore-og-margin-note-sticker

**Date:** 2026-05-31  
**Atom:** Explore L5 — LIVE staff sticker when OG rows carry margin notes  
**Route:** `/og/explore`

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-explore.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?download=1"
file /tmp/og-explore.png
```

## Results

| Check | Result |
|-------|--------|
| pytest sticker | 2 passed |
| web build | exit 0 |
| curl explore OG | `200 73163` |
| PNG | 1200×630, ≥40KB |

## Verdict

**PASS** — `showStaffLiveSticker` renders `LIVE · staff notes` when `hasMarginNotes && !isDemo`.
