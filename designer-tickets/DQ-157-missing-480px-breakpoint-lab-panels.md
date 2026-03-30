---
id: DQ-157
priority: P2
area: responsive
section: mobile-breakpoints
type: design-gap
status: open
---

# Missing 480px breakpoint bridge in lab-panels.css global mobile block

## What's wrong

The global mobile rules in lab-panels.css (line 3761) jump from 768px directly to 375px. There's no 480px breakpoint between them. Phones between 376-479px (iPhone 12/13/14 at 390px, Pixel 6 at 412px) get the 768px tablet styles, which may have oversized padding, multi-column layouts, or font sizes optimized for tablet, not phone.

## Where

- `frontend/lab-panels.css:3761-3785` — `@media (max-width: 768px)` global block
- `frontend/lab-panels.css:3787` — `@media (max-width: 375px)` block exists
- Gap: no `@media (max-width: 480px)` between them

Note: Other sections of lab-panels.css DO have all three breakpoints (768px, 480px, 375px) — see lines 910, 1731, 2672, 2855, 3219, 4294, 4658. This gap is only in the global mobile block.

## Fix

Add a `@media (max-width: 480px)` block between lines 3785 and 3787 with tighter spacing, smaller fonts, and single-column overrides for phone screens. Mirror the pattern used in the per-panel breakpoints.

## Why it matters

iPhone 12/13/14 (390px width) is the single most common phone viewport. It falls into the 768px rules, which are designed for iPad. Panels may look cramped or misaligned on the most popular phone in the world.
