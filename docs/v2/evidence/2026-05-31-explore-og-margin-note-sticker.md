# Evidence — explore-og-margin-note-sticker (2026-05-31)

## Slice

Explore L5 — LIVE staff margin sticker on OG when live top-3 rows carry Hawkeye/Dolphin margin notes.

## Commands (executed)

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 73163
file /tmp/explore-og.png
# PNG 1200x630
```

## Gate C

| Check | Result |
|-------|--------|
| Route `/og/explore` | 200 |
| PNG size | 73163 B (≥40KB) |
| LIVE sticker | Shown when `!isDemo && topRowsHaveStaffMarginNotes` (pytest guards) |

## Verdict

PASS — sticker atom 3/4; demo curl unchanged ≥40KB.
