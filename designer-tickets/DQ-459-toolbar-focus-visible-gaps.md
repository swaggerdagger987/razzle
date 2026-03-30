---
id: DQ-459
priority: P2
category: accessibility
status: open
cycle: 58
---

# DQ-459: 6 toolbar/page-level interactive elements missing :focus-visible

## Problem

DQ-094 covers the 116 `:hover` rules in lab-panels.css missing `:focus-visible`. This ticket covers 6 **different** interactive elements in lab.html, styles.css, and standalone pages that have `:hover` but no `:focus-visible`:

1. **`.add-filter-btn`** (lab.html ~line 862-885) — The "Add Filter" button in the screener toolbar. Has `:hover` background change, no `:focus-visible`.
2. **`.scroll-top-btn`** (lab.html ~line 1707-1730) — Scroll-to-top FAB. Has `:hover`, no `:focus-visible`.
3. **`.mgr-compare-btn`** (league-intel.html ~line 507-525) — Manager compare button. Has `:hover`, no `:focus-visible`.
4. **`.matchups-pos-tab`** (matchups.html ~line 73-94) — Position filter tabs on matchup heatmap. Has `:hover`, no `:focus-visible`.
5. **`.ask-ref-item`** (agents.html ~line 470-488) — "What can I ask?" reference buttons. Has `:hover`, no `:focus-visible`.
6. **`.nav-search-hint`** (styles.css ~line 445-461) — Ctrl+K search hint in nav bar. Has `:hover`, no `:focus-visible`.

## Fix

For each, add a matching `:focus-visible` rule:
```css
.add-filter-btn:focus-visible,
.scroll-top-btn:focus-visible,
.matchups-pos-tab:focus-visible,
.ask-ref-item:focus-visible,
.nav-search-hint:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

For `.mgr-compare-btn` in league-intel.html, add the same pattern in its `<style>` block.

## Why It Matters

Keyboard users tab through these elements with zero visual feedback. They're all primary interaction points — filter buttons, navigation, search.

## Verification

Tab through the Lab toolbar, matchup page tabs, and agent reference panel. Each element should show an orange outline on focus.
