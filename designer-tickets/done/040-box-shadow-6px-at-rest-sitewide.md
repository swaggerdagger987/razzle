# DES-040: box-shadow 6px used at rest on 30+ components — should be 4px

**Priority**: P2
**Area**: sitewide (20+ HTML pages, lab-panels.css, styles.css, lab.js, app.js)
**Impact**: DESIGN.md specifies `4px 4px 0` as the base card shadow and `6px 6px 0` + translate as the hover-lift state. But 30+ components use `6px 6px 0` as their DEFAULT (non-hover) shadow, making hover-lift impossible or incoherent.

## The Problem

DESIGN.md says:
- **Box shadows**: `4px 4px 0 var(--ink)` on cards, containers
- **Hover lift**: `6px 6px 0` + `translate(-2px, -2px)`

But grep found 60+ instances of `box-shadow: 6px 6px 0` — many at rest (not :hover).

**Page-level CSS (static cards, not hover):**
- league-intel.html: connect-card, odds cards, manager profile cards (8 instances)
- aging.html: chart container, filter section (2)
- buysell.html, breakouts.html, cheatsheet.html, leaders.html, prospects.html, rankings.html, etc.
- lab-panels.css: 6 instances on panel containers

**JS-generated inline styles:**
- lab.js: 5+ modal/popup dialogs with `box-shadow:6px 6px 0`
- app.js: auth modal, saved views modal (2 instances)
- lab.html: 12+ modal containers in HTML

**Correctly using 6px for hover only:**
- pricing.html: `.plan-card:hover { box-shadow: 6px 6px 0 }` — CORRECT
- prompts.html: `.prompt-card:hover { box-shadow: 6px 6px 0 }` — CORRECT

## The Fix

For **page-level cards and containers**: change from `6px 6px 0` to `4px 4px 0`. These are the components that should lift on hover.

For **modals and overlays**: 6px may be intentionally larger for emphasis. Consider defining a `--shadow-modal` token (e.g., `6px 6px 0 var(--ink)`) to distinguish modal shadows from card shadows.

## Why This Matters

The hover-lift effect is a core part of Razzle's "physical" interaction feel (DESIGN.md: "interaction should feel physical"). If cards start at 6px shadow, there's nowhere to lift TO. The visual feedback loop breaks — hover does nothing because the card is already at maximum shadow depth.
