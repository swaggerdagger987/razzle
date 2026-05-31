# Evidence — Explore OG college margin demo rows (2026-05-31)

**Atom:** `explore-og-margin-note-college` (epic 4/4)

```bash
pytest apps/api/tests/test_explore_og_margin_note_college.py -q  # 2 passed
curl -s -o /tmp/college-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?force_demo=1&universe=college&download=1"
# 200 78718
```

**Verdict:** PASS
