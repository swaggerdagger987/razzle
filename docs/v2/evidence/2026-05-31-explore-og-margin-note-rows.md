# Evidence — Explore OG top-3 margin notes (2026-05-31)

**Atom:** `explore-og-margin-note-rows` (epic 2/4)  
**Route:** `GET /og/explore?force_demo=1&download=1`

## Contract checks

```text
pytest apps/api/tests/test_explore_og_margin_note_rows.py -q  → 3 tests (source guards)
pytest apps/api/tests/test_explore_og_margin_note_lead.py -q  → 4 tests (updated for marginNotesByIndex)
npm run build --workspace=apps/web                          → exit 0 (this cycle)
```

## Inline guard (VM without full api venv)

```bash
python3 -c "… MARGIN_NOTE_ROW_LIMIT, marginNotesByIndex, no leadMarginNote …"  # OK
```

## Gate C — PNG size (run after merge on preview or local)

```bash
curl -s -o /tmp/explore-og-rows.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&download=1"
# 2026-05-31 local: HTTP 200 size 73163 (PNG 1200x630)
```

## Product

- Rows #1–3 on Explore OG card show Caveat staff margin notes (Hawkeye/Dolphin) when stats match `marginNoteForOgExploreRow`.
- Demo NFL rows: Daniels youth breakout, Chase heavy targets, Robinson youth breakout.

**Verdict:** PASS candidate pending curl on merged preview.
