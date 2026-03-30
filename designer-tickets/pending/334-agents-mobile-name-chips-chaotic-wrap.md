# DES-334: Agents page mobile — name chips wrap chaotically at 375px

**Priority**: P2
**Category**: Mobile UX — Layout
**Affects**: frontend/agents.html agent name chip navigation at 375px
**Cycle**: 4 (visual QA)

## Problem

At 375px mobile width, the 6 agent name chips (Razzle, Hawkeye, Bonus, Dr. Dolphin, Atlas, Octo) wrap across 2-3 lines with uneven spacing and inconsistent row counts. The chips have varying text lengths, so some rows have 3 chips and others have 2, creating a chaotic, unbalanced layout.

## Evidence

Screenshot at 375x812 shows agent name chips wrapping across multiple lines above the bio cards. The wrapping is determined by content width, not by a deliberate grid. "Dr. Dolphin" is significantly wider than "Octo", causing uneven rows.

## Fix

Convert to a horizontal scrollable strip at mobile widths:

```css
@media (max-width: 480px) {
  .warroom-hero-badges {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
  }
}
```

A single scrollable row keeps all 6 chips visible in a clean horizontal line that users can swipe through, matching the pattern used for position filter pills elsewhere on the site.

## Why it matters

The agent chips are navigation — they let you jump to a specific agent's bio card. Chaotic wrapping makes it hard to find the agent you want. A clean horizontal strip communicates "these are 6 peers in a row" which matches the Situation Room's team structure.
