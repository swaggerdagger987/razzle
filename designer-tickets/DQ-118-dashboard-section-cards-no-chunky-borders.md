# DQ-118: Dashboard section cards lack chunky borders — flat compared to rest of site

**Priority**: P3 (visual consistency)
**Category**: Component Consistency
**Severity**: Low — dashboard looks less polished than other pages

## Problem

The dashboard page (dashboard.html) section containers for "RISING STOCKS", "FALLING STOCKS", "VALUE PICKS", and "POSITION SCARCITY" use simple dashed top borders as section dividers. They lack the chunky 3px solid border + 4px offset shadow treatment that defines the Razzle card aesthetic.

Compared to:
- Breakouts page: cards have full chunky borders with shadows
- Rankings page: tier rows have colored left borders with card treatment
- Trade values page: tier sections have visual weight

The dashboard sections feel flat and utilitarian. The "at-a-glance overview" subtitle and top-5 player stat cards look great, but the list sections below feel like they belong to a different design system.

## Screenshot evidence

Dashboard zoom at 1440x900 shows "RISING STOCKS" section starting with just a dashed top border — no card wrapper, no shadow, no visual container.

## Fix

Wrap each dashboard section in a card container:
```css
.db-section {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: var(--radius);
  box-shadow: 4px 4px 0 var(--ink);
  padding: 20px;
  margin-bottom: 24px;
}
```

Keep the section headers in Luckiest Guy with the pencil icon, but give them the visual weight of a Razzle card.

## Not a duplicate of

- DQ-057 (dashboard cards no position stripe) — about the TOP-5 player cards missing position-colored top stripe. This is about the SECTION containers below them.
- DQ-107 (dashboard stat cards subtitle unreadable) — about text readability in stat cards. This is about missing card borders on sections.
