# Evidence — lab-buysell-empty-export (2026-05-31)

**Atom:** `lab-buysell-empty-export`  
**Epic:** Lab L5 — Launch-10 empty-board OG exports (atom 2/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_export_link.py::test_buysell_empty_board_exports_sample_card -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-buysell-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&force_demo=1'
file /tmp/og-buysell-snap.png
```

## Results

| Check | Result |
|-------|--------|
| pytest | 1 passed |
| web build | exit 0 |
| curl buysell OG | 200 64866 bytes |
| PNG | 1200×630 |

## Verdict

**PASS** — Gate C satisfied (PNG ≥ 40KB). Empty buy/sell lanes export `BUYSELL_SAMPLE_OG_ROWS` via `LabOgExportLink` with `export sample card` label.
