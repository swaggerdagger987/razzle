# Evidence — lab-breakouts-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-breakouts-empty-export`  
**Route:** `/og/breakouts`

## Acceptance

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_lab_og_export_link.py` | 8 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| Gate C — demo OG PNG | PASS |

## curl (Gate C)

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
# 200 66253 — PNG 1200×630

# snapshot path (FROM PANEL empty board export)
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&snapshot=<encoded>'
# 200 ≥40KB
```

## Product

- `BreakoutsRenderer` empty state now offers `export sample card` with `BREAKOUTS_SAMPLE_OG_ROWS` (Hawkeye RBS board names).
- Mirrors aging/weekly/rankings empty OG pattern — no loading-copy-only dead end.

## Trust

- T5: export card shows recognizable breakout names when API returns zero candidates.
- T6: two-file surgical slice; reuses `LabOgExportLink` snapshot encoding.

**Verdict:** PASS
