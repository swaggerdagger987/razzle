# Evidence — lab-breakouts-empty-export (2026-05-31)

**Atom:** `lab-breakouts-empty-export`  
**Epic:** Lab L5 — Launch-10 empty-board OG exports (atom 1/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_export_link.py::test_breakouts_empty_board_exports_sample_card -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&force_demo=1'
file /tmp/og-breakouts-snap.png
```

## Results

| Check | Result |
|-------|--------|
| pytest | 1 passed |
| web build | exit 0 |
| curl breakouts OG | 200 66253 bytes |
| PNG | 1200×630 |

## Verdict

**PASS** — Gate C satisfied (PNG ≥ 40KB). Empty breakouts board exports `BREAKOUTS_SAMPLE_OG_ROWS` via `LabOgExportLink` with `export sample card` label.
