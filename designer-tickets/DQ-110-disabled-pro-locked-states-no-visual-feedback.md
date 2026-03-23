# DQ-110: Disabled / Pro-locked interactive elements show no cursor or opacity change

**Priority**: P2
**Category**: Interaction design / affordance
**Severity**: Medium — users click locked content expecting it to work
**Evidence**: Code search — only 5 `cursor:not-allowed` instances vs 371 `cursor:pointer`. Visual — Awards Pro gate page shows "See Plans" button but locked panels in Lab sidebar still show pointer cursor.

## What's wrong

When a free user encounters Pro-locked content:
1. **Cursor remains pointer** — locked panels in the Lab sidebar, locked standalone pages, and Pro-gated features all show `cursor: pointer` even though clicking them shows a gate/paywall. Users expect something to happen.
2. **No opacity reduction** — locked items appear identical to unlocked ones until clicked. There's no visual affordance (dimming, lock icon overlay, reduced opacity) to distinguish locked from unlocked BEFORE clicking.
3. **Only 5 total `cursor:not-allowed`** in the codebase — exclusively in agents.html (2), lab-panels.css (1), lab.html (1), styles.css (1). The Lab sidebar panel list, standalone page links, and pricing feature comparison all lack disabled cursor.

## Where

- Lab sidebar panel list items that require Pro
- Standalone page nav links to Pro-locked pages
- Home page feature cards linking to Pro panels
- Any interactive element that leads to a Pro gate

## Fix

1. Add CSS rule: `.pro-locked { cursor: not-allowed; opacity: 0.7; }` (or `opacity: 0.6`)
2. Apply `.pro-locked` class to all Pro-gated links/buttons when user is not Pro
3. Add a subtle lock icon overlay (CSS `::after` pseudo-element) on locked items
4. On hover, show a tooltip: "Pro feature — upgrade to unlock"

## Verification

As a free user, hover over a Pro-locked panel in the Lab sidebar. Cursor should be not-allowed. Item should appear visually dimmed with a lock indicator.
