# DES-158: Z-index stacking context ungoverned — 42 instances, no hierarchy

**Priority**: P1 (Interaction bugs — modals/tooltips can stack wrong)
**Page**: Sitewide (8 files)
**Category**: Design system

## The Problem

42 z-index values are scattered across 8 files with no central hierarchy. Six separate elements use `z-index: 9999`, one uses `99999`, and one uses `10001`. When multiple overlays are open simultaneously (e.g., upgrade gate modal + tooltip + dropdown), stacking order is unpredictable.

## Evidence

**styles.css** (11 unique z-index declarations):
- `z-index: 1` (scroll indicator)
- `z-index: 100` (modal bg)
- `z-index: 1000` (tooltip, popover x3)
- `z-index: 9000` (dropdown)
- `z-index: 9998` (offline banner)
- `z-index: 9999` (dialog overlay x3)
- `z-index: 10000` (form modal)

**lab-panels.css** (15 declarations):
- `z-index: 1-3` (table sticky cols/rows)
- `z-index: 10` (tooltip, autocomplete)
- `z-index: 50` (filter/autocomplete dropdown)

**JS inline styles** (8 declarations across app.js, compare.js, formula-store.js, player.js, lab.js):
- `z-index: 100` (nudge toast)
- `z-index: 9999` (modal overlays x2)
- `z-index: 10000` (modal content x3)
- `z-index: 10001` (confetti)
- `z-index: 99999` (particle effect)

**Conflicts**: `z-index: 9999` appears 6 times across 4 files. If the upgrade gate (9999), a tooltip (1000), and the offline banner (9998) are all visible, the offline banner sits UNDER the upgrade gate — correct by accident, not by design.

## The Fix

1. Define a z-index scale as CSS custom properties in `:root`:
   ```css
   --z-table: 1-5;      /* sticky cols, row hover */
   --z-dropdown: 50;     /* filter dropdowns, autocomplete */
   --z-tooltip: 100;     /* tooltips, popovers */
   --z-banner: 500;      /* offline banner, nudge toast */
   --z-modal-bg: 1000;   /* modal backdrops */
   --z-modal: 1001;      /* modal content */
   --z-system: 9999;     /* confetti, particles (brief) */
   ```
2. Replace all 42 hardcoded z-index values with the appropriate token
3. Remove `z-index: 99999` — nothing should exceed 9999

## Why This Matters

The upgrade gate modal is the #1 conversion touchpoint for free users. If it renders behind a tooltip or gets visually buried by a panel dropdown, the user can't click "Get Pro." That's a lost conversion from a stacking bug.
