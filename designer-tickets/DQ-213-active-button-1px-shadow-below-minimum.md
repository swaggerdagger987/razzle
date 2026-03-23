# DQ-213: Button :active states use 1px shadow — below design minimum

**Priority**: P2
**Category**: Visual / Brand consistency
**Page**: Sitewide

## What's wrong

Four button `:active` rules use `box-shadow: 1px 1px 0 var(--ink)`. DESIGN.md explicitly says "NO thin 1px borders" — and 1px shadows break the chunky aesthetic just as much. The button "deflates" from 4px shadow to 1px on press, losing the comic-strip tactile feel.

## Where

- `styles.css:257` — `.hamburger-toggle:active { box-shadow: 1px 1px 0 var(--ink); }`
- `styles.css:325` — `.mobile-nav-close:active { box-shadow: 1px 1px 0 var(--ink); }`
- `styles.css:771` — `.btn-chunky:active { box-shadow: 1px 1px 0 var(--ink); }`
- `styles.css:799` — `.btn-primary:active { box-shadow: 1px 1px 0 var(--ink); }`

## Fix

Change all four to `box-shadow: 2px 2px 0 var(--ink)`. The press state should feel like a button being pushed IN, not disappearing. 4px → 2px on press is a satisfying "click"; 4px → 1px is too jarring.

## Not a dupe of

- DQ-002 (btn-chunky shadow too thin) — that's about the default/hover shadow, not the :active pressed state
- DQ-011 (sitewide box-shadow undersized) — broad ticket about default shadows, not active states specifically
