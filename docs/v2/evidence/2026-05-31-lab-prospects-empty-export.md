# Evidence — lab-prospects-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-prospects-empty-export`  
**Route:** `/og/prospects`

## Acceptance

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_lab_og_export_link.py` | 9 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| Gate C — demo OG PNG | PASS |

## curl (Gate C)

```bash
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
# 200 63453 — PNG 1200×630
```

## Product

- `ProspectsRenderer` empty state now offers `export sample card` with `PROSPECTS_SAMPLE_OG_ROWS` (Hawkeye RPS board names aligned with `/og/prospects` demoRowsForPanel).
- Mirrors breakouts/aging/weekly empty OG pattern — no loading-copy-only dead end.

## Trust

- T5: export card shows recognizable prospect names when API returns zero rows.
- T6: two-file surgical slice; reuses `LabOgExportLink` snapshot encoding.

**Verdict:** PASS
