# FUNC-019: SEO routes broken on production (deployment gap)

## Severity: P0

## Summary
All SEO-friendly routes (`/player/{id}`, `/compare/{id1}/{id2}`, `/team/{abbr}`) are completely broken on production. Pages render as unstyled HTML with no JavaScript functionality. This affects every player click from 33 files that link to these routes.

## Root Cause
FUNC-018 fix (`<base href="/">` added to player.html, compare.html, team.html) exists in `ship/launch-fixes` branch but has NOT been deployed to `master`/production. Without `<base href="/">`, relative asset paths resolve incorrectly:
- `/player/00-0036389` resolves `styles.css` to `/player/styles.css` (404, served as HTML by SPA fallback)
- `/compare/00-0036389/00-0037013` resolves `app.js` to `/compare/00-0036389/app.js`
- `/team/KC` resolves `styles.css` to `/team/styles.css`

## Evidence
```
# Production test (2026-03-20):
/player/00-0036389 → 3 JS errors:
  - Refused to apply style from '/player/styles.css' (MIME type text/html)
  - Refused to execute script from '/player/app.js' (MIME type text/html)
  - Refused to execute script from '/player/player.js' (MIME type text/html)

/compare/00-0036389/00-0037013 → 3 JS errors (same pattern)
/team/KC → 2 JS errors (same pattern)

# Local test (with fix): 0 JS errors, all pages render correctly
```

## Impact
- 33 frontend files link to `/player/` routes (standalone panels, app.js popup, compare pages)
- Every player click from rankings, trade values, awards, aging curves, etc. leads to broken blank page
- Footer "Teams" links on all 74 pages lead to broken team page
- SEO/social sharing of player URLs is completely broken

## Fix
Push `ship/launch-fixes` to `master` and redeploy. The code fix is verified correct locally:
- `<base href="/">` at line 4 of player.html, compare.html, team.html
- All relative paths resolve correctly with this tag

## Action Required
**HUMAN ACTION**: Push ship/launch-fixes to master and trigger Render redeploy.
```bash
git checkout master
git merge ship/launch-fixes
git push origin master
```
