# Evidence — Explore OG staff margin sticker (2026-05-31)

**Atom:** `explore-og-margin-note-sticker`  
**Route:** `/og/explore`  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/explore-og-sticker.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/explore?demo=1&download=1"
```

## Results

- pytest: 3 passed (`test_explore_og_margin_note_sticker.py`)
- web build: exit 0
- curl `?demo=1&download=1`: **200** PNG **68699** bytes (STAFF · margin notes sticker + row notes)
