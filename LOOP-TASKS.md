# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 70 (Screener Scroll-to-Top + Header Shadow)
## Phase 70: Screener Scroll-to-Top + Header Shadow
**Exit Criterion**: Table header gets a bottom shadow when scrolled. Floating scroll-to-top button appears when scrolled past 200px. Both subtle, design-guide-compliant. Works in all modes.

- Task 1: PASS
- Stage: COMPLETE
- Next: QA + UX audit (Phase 70 is multiple of 5)

### Task 1: Header shadow + scroll-to-top button
**Status**: PASS
**Attempts**: 1
**Result**: thead-shadow CSS class toggles box-shadow on th elements when scrollTop > 0. Scroll-to-top button (circle with up arrow, chunky border, 3px shadow) appears at scrollTop > 200. Smooth scroll behavior. Both integrate with existing RAF-throttled onTableScroll handler.
