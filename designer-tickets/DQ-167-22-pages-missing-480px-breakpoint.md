# DQ-167: 22 standalone pages missing 480px mobile breakpoint

**Priority:** P2
**Area:** Mobile / Responsive
**Type:** Missing breakpoint
**Impact:** 22 pages have no small-phone layout — content may overflow or be cramped at 375-480px

---

## Problem

53 of 75 pages have a `@media (max-width: 480px)` breakpoint for small phone layouts. The remaining 22 pages only have the 768px tablet breakpoint, leaving a gap for the ~375-480px phone range that represents the majority of mobile traffic.

### Missing 480px breakpoint (22 pages)
- about.html
- advantage.html
- breakdown.html
- comptable.html
- drops.html
- dualthreat.html
- fptsbreakdown.html
- gamelog.html
- gamescript.html
- garbagetime.html
- handcuffs.html
- prompts.html
- recap.html
- records.html
- seasonpace.html
- snapefficiency.html
- stacks.html
- streaks.html
- successrate.html
- targetpremium.html
- tdregression.html
- workload.html

## Note

Different from DQ-157 which covers lab-panels.css only. These are standalone HTML pages with their own `<style>` blocks.

## Fix

Add `@media (max-width: 480px)` rules to each page's `<style>` block. Typical adjustments needed:
- Reduce heading font-size (28px -> 22px)
- Reduce card padding (24px -> 14px)
- Stack horizontal layouts to vertical
- Reduce table font-size for readability

## Verification
- Open each page at 375px viewport width.
- Content should be readable without horizontal scrolling.
