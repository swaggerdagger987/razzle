# Evidence — Explore OG lead-row margin note (2026-05-31)

**Atom:** `explore-og-margin-note-lead` (Explore L5 epic 1/3)  
**Trust:** T5, T6

## Dedup

Feature landed on base via PR #1364 (`0fc4932b7`). Factory cycle 154 re-verified Gate C and recorded standup state.

## Commands

```bash
JWT_SECRET=test pytest apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 65482

curl -s -o /tmp/explore-college.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&force_demo=1&download=1"
# 200 71510
```

## Verdict

PASS — NFL demo lead row shows Hawkeye youth breakout tape; college demo Cam Ward has passing_yards for campus margin rules; PNGs ≥40KB.
