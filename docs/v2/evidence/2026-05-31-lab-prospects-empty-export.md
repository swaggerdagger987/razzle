# Evidence — lab-prospects-empty-export (cycle 159)

**Date:** 2026-05-31  
**Atom:** `lab-prospects-empty-export`  
**Verdict:** PASS

## Commands

```bash
pytest apps/api/tests/test_lab_og_export_link.py::test_prospects_empty_board_exports_sample_card -q
npm run build --workspace=apps/web
curl -s -o /tmp/og-prospects.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/prospects?download=1&snapshot=<sample>"
file /tmp/og-prospects.png
```

## Results

| Check | Result |
|-------|--------|
| pytest | 1 passed |
| web build | exit 0 |
| OG curl | 200, 52990 bytes |
| PNG | 1200×630 |

## Notes

- `PROSPECTS_SAMPLE_OG_ROWS` mirrors `DEMO_ROWS_BY_SLUG.prospects` in `/og/[panel]/route.tsx`.
- Empty Hawkeye prospects board shows `export sample card` link with snapshot payload.
