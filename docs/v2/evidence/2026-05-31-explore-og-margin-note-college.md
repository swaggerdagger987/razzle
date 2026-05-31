# Evidence — explore-og-margin-note-college

**Date:** 2026-05-31  
**Atom:** Explore L5 — College universe margin notes on OG export (4/4)  
**Route:** `/og/explore?universe=college`

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_og_margin_note_college.py \
  apps/api/tests/test_explore_og_college_gate_c.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-college.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?universe=college&force_demo=1&download=1"
```

## Results

| Check | Result |
|-------|--------|
| pytest | 7 passed |
| web build | exit 0 |
| curl college OG | `200 79069` |

## Verdict

**PASS** — Base OG route renders Hawkeye campus notes via `marginNoteForOgExploreRow(p, universe)`; pytest guards college demo heuristics.
