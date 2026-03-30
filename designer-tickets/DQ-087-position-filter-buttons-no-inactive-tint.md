# DQ-087: Position filter buttons show no position color when inactive

**Priority**: P2 — visual identity / position colors
**Category**: Design System / Position Colors
**Files**: `frontend/rankings.html:65-86`, `frontend/tiers.html:96-112`, `frontend/dashboard.html`, 10+ standalone pages

## Problem

Position filter buttons (ALL / QB / RB / WR / TE) on standalone pages show position color ONLY when `.active` is added. In inactive state, all buttons are plain `var(--bg-card)` with `var(--ink)` text — identical, colorless.

```css
/* Rankings example */
.rankings-filter-btn {
  background: var(--bg-card);  /* plain — no position hint */
  border: 2px solid var(--ink);
}
.rankings-filter-btn.active.pos-qb {
  background: var(--pos-qb);  /* color only when active */
}
```

Result: a row of 5 identical-looking buttons. The user has to READ the text to distinguish QB from WR. Position colors are the strongest visual identifier in the entire design system — they should be visible before interaction, not just after.

## Fix

Add a light position tint to inactive buttons:

```css
.rankings-filter-btn.pos-qb {
  border-color: var(--pos-qb);
  color: var(--pos-qb);
}
.rankings-filter-btn.pos-rb {
  border-color: var(--pos-rb);
  color: var(--pos-rb);
}
.rankings-filter-btn.pos-wr {
  border-color: var(--pos-wr);
  color: var(--pos-wr);
}
.rankings-filter-btn.pos-te {
  border-color: var(--pos-te);
  color: var(--pos-te);
}
```

Active state adds filled background (existing behavior). Inactive state shows tinted border + text.

Apply to all pages with position filter tabs: rankings, tiers, dashboard, breakouts, buysell, stocks, efficiency, consistency, reportcard, awards, vorp.

## Why It Matters

DESIGN.md: "Position colors consistently (QB=blue, RB=teal, WR=terracotta, TE=purple)." The filter buttons are the most common position color surface across 10+ pages. Making them colorless until clicked wastes the strongest visual identifier in the system.

## Verification

Open rankings.html. Before clicking any filter, the QB button should have blue border/text, RB teal, WR terracotta, TE purple. Clicking fills the background (existing). ALL button stays neutral.
