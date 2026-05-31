# Evidence — Explore OG LIVE staff margin sticker

**Date:** 2026-05-31  
**Atom:** `explore-og-margin-note-sticker`  
**Verdict:** PASS

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_margin_note_lead.py apps/api/tests/test_explore_og_margin_note_sticker.py -q --noconftest
npm run build --workspace=apps/web
```

| Check | Result |
|-------|--------|
| pytest | 7 passed |
| web build | exit 0 |

**Verdict:** PASS
