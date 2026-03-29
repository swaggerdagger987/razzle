# CEO-033: Footer Links → Lab Panel URLs

**ID**: 20260321-160003-033
**Page**: Footer (all pages)
**Type**: structural
**Severity**: P1
**Created**: 2026-03-21 (CEO Review #3)
**Related**: CEO-022 (page consolidation — this is the footer-specific subset)

## Problem

The footer on index.html (and all pages) links to ~35 standalone HTML pages that duplicate Lab panels. This splits SEO value, confuses navigation (two URLs for the same tool), and makes the Lab look less impressive because content is scattered.

## BEFORE

```html
<a href="/rankings.html" class="footer-link">Rankings</a>
<a href="/tradevalues.html" class="footer-link">Trade Values</a>
<a href="/aging.html" class="footer-link">Aging Curves</a>
<!-- ... 30+ more standalone URLs -->
```

## AFTER

```html
<a href="/lab.html?panel=rankings" class="footer-link">Rankings</a>
<a href="/lab.html?panel=tradevalues" class="footer-link">Trade Values</a>
<a href="/lab.html?panel=aging" class="footer-link">Aging Curves</a>
<!-- All point to Lab panel canonical URLs -->
```

## Why

- One canonical URL per tool = better SEO
- Every click drives users INTO the Lab where they discover more panels
- The Lab sidebar becomes the discovery mechanism, not Google
- Standalone pages can later 301-redirect to Lab panel URLs

## Acceptance Criteria

- [ ] All footer links that correspond to Lab panels use `/lab.html?panel=X` URLs
- [ ] Links that DON'T have Lab panel equivalents (compare, team, player) remain as-is
- [ ] Footer still organized by category (Dynasty, Weekly, Analytics, Tools)
- [ ] Lab correctly opens the specified panel from `?panel=X` URL parameter
