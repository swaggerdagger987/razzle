# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 2 (sidebar polish)
- Task: Refine sidebar UX
- Stage: BUILD
- Attempt: 1/3
- Tasks Done: 4/7

## Phase 1: Navigation Surgery -- COMPLETE
### Task 1: Slim nav to 4 items on all pages
**Accept when**: All 72 HTML files have slim nav (Home, The Lab, War Room, Sign In + Ctrl+K hint)
**Status**: PASS

## Phase 2: The Lab Sidebar -- COMPLETE (initial)
### Task 1: Sidebar shell + panel infrastructure
**Accept when**: lab.html has collapsible sidebar with all categories/tools. Panel switching works. URL state updates.
**Status**: PASS

### Task 2: Smart redirects from standalone pages
**Accept when**: All 63 standalone pages redirect to lab.html?panel=X when loaded directly, but NOT when in iframe
**Status**: PASS

## Phase 3: Season Expansion -- COMPLETE
### Task 1: Expand data ranges to 2015+
**Accept when**: nflverse and cfbfastR adapters + bootstrap default to 2015-present
**Status**: PASS

## Remaining Tasks
- Phase 4: College integration (universe toggle across all panels)
- Phase 5: Polish (transitions, keyboard nav, breadcrumbs)
