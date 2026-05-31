# Evidence — Explore OG college universe margin notes

**Cycle:** 159  
**Atom:** `explore-og-margin-note-college`  
**Epic:** Explore L5 — OG screener agent margin notes (4/4)

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_og_margin_note_college.py apps/api/tests/test_explore_og_margin_note_rows.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-college-margin.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1&force_demo=1'
```

## Results

- pytest: 8 passed
- web build: exit 0
- curl college OG: `200 72814` PNG 1200×630

## Verdict

**PASS** — College demo OG shows Hawkeye campus margin notes on ranks 1–3 via existing `marginNoteForOgExploreRow`; demo subtitle calls out campus notes when SAMPLE rows carry staff annotations.
