<!-- PM: ready -->
---
id: DES-349c
parent: 349 (Footer Teams Link Epic)
priority: P3
area: remaining pages
section: footer navigation
type: ux / navigation
status: open
---

# Verify no /team/KC footer links remain anywhere

**Files**: All `frontend/*.html`

## What to do

After DES-349a and DES-349b are complete, run a final sweep:
```bash
grep -rn "/team/KC" frontend/*.html
```

Any remaining matches should be in non-footer contexts (e.g., team roster links in page content) which are correct and should NOT be removed.

## Accept when

- Zero `/team/KC` matches in `<footer>` or footer-like sections
- Non-footer `/team/KC` links (e.g., team roster links in content) are untouched
