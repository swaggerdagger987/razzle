# Evidence — lab-dashboard-empty-export (2026-05-31)

## Slice

Lab L5 atom 3/3: Dynasty dashboard exports `DASHBOARD_SAMPLE_OG_ROWS` when
`isEmptyBoard` (no top5, risers, fallers, or value picks).

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_lab_og_export_link.py::test_dashboard_empty_board_exports_sample_card -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/dashboard-og.png -w "http=%{http_code} bytes=%{size_download}\n" \
  "http://localhost:3000/og/dashboard?download=1"
# http=200 bytes=66547

file /tmp/dashboard-og.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — Gate C satisfied (200, PNG ≥40KB, 1200×630).
