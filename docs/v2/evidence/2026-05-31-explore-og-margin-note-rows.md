# Evidence — explore-og-margin-note-rows

**Date:** 2026-05-31  
**Atom:** Margin notes on top-3 Explore OG screener rows  
**Verdict:** PASS

## Gate C — demo Explore OG PNG

```bash
curl -s -o /tmp/og-explore-rows.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1'
# 200 67971
file /tmp/og-explore-rows.png
# PNG 1200x630
```

Demo rows #1–#2 show Hawkeye/Dolphin margin notes (youth breakout + heavy targets).

## Contract guards

```bash
pytest apps/api/tests/test_explore_og_margin_note_rows.py \
  apps/api/tests/test_explore_og_margin_note_lead.py -q --noconftest
# 6 passed
npm run build --workspace=apps/web
# exit 0
```

## Verdict

PASS — FACTORY-DOD Gate C; Explore L5 margin notes on top-3 OG rows.
