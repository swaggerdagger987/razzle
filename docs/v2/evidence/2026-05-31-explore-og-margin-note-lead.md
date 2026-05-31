# Evidence — Explore OG lead-row margin note (2026-05-31)

**Atom:** `explore-og-margin-note-lead` (Explore L5 epic 1/3)  
**Trust:** T5, T6

## Commands

```bash
JWT_SECRET=test pytest apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/explore-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 200 65482
file /tmp/explore-og.png
# PNG 1200x630
```

## Verdict

PASS — demo NFL lead row (Jayden Daniels, age 22, 312 FPTS) renders Hawkeye `youth breakout tape` under name on OG card; PNG ≥40KB.
