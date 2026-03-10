# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## Ticket: Lab Polish

**Phase Name**: Lab Polish — transitions, keyboard nav, virtual scrolling, UX refinements
**Exit Criterion**: The Lab feels fast, fluid, and professional. Panel transitions are smooth. Keyboard users can navigate the full sidebar and table. Tables with 500+ rows don't lag. The experience is screenshot-worthy.

### Task 1: Panel transition animations
**Requirement**: Add smooth transitions when switching panels. Outgoing panel fades out (opacity 1->0, 150ms), incoming panel fades in (opacity 0->1, 150ms). Use CSS transitions, not JS animation. Loading state ("pulling film...") appears during data fetch with a subtle fade. No jarring content shifts.
**Accept when**: Panel switches feel smooth. No flash of empty content. Loading state appears for uncached panels.
**Depends on**: none
**Size**: S

### Task 2: Sidebar keyboard navigation
**Requirement**: Arrow Up/Down navigates sidebar items. Enter activates the focused item. Home/End jump to first/last item. Escape closes mobile sidebar. Tab cycles through sidebar -> main content -> toolbar logically. Active item has visible focus ring (2px `var(--orange)` outline). Screen reader announces category and item names.
**Accept when**: Full sidebar navigation works with keyboard only. Focus ring visible. ARIA labels present.
**Depends on**: none
**Size**: M

### Task 3: Table keyboard navigation
**Requirement**: Within data tables, Tab moves between interactive cells. Arrow keys navigate rows. Enter on a player row opens their profile panel. Shift+Enter adds to compare. Header click for sort works via keyboard (Enter on focused header). Focus stays visible with outline.
**Accept when**: Users can navigate, sort, and select players in any table using only keyboard.
**Depends on**: none
**Size**: M

### Task 4: Virtual scrolling for large tables
**Requirement**: Tables with 500+ rows use virtual scrolling -- only render visible rows + buffer (20 rows above/below viewport). Scroll position maintained on re-render. Row height fixed at 36px for predictable virtualization. Implement in lab.js without external libraries.
**Accept when**: A table with 1000+ rows scrolls at 60fps. DOM has <100 `<tr>` elements at any time. No visible flicker during scroll.
**Depends on**: none
**Size**: L

### Task 5: Sidebar collapse/expand polish
**Requirement**: Sidebar collapse animation: width transitions from 260px to 48px over 200ms ease. Collapsed state shows category icons only (text emoji). Tooltip on hover shows full item name. Expand on hover (optional, behind localStorage pref). Collapse state persisted in localStorage. Main content area adjusts margin smoothly.
**Accept when**: Collapse/expand is smooth. Icons visible in collapsed state. Tooltips work. Preference persists.
**Depends on**: none
**Size**: M

### Task 6: Breadcrumb and panel header polish
**Requirement**: Every panel shows a header with: breadcrumb ("The Lab > Rankings & Values > Dynasty Rankings"), panel title in display font, and a subtitle in Caveat with contextual flavor text (e.g., "the only rankings that matter" for Dynasty Rankings). Season/position filters appear inline in the header where applicable.
**Accept when**: Every panel has a styled header with breadcrumb, title, and flavor text. Filters are inline, not in a separate toolbar row.
**Depends on**: none
**Size**: M

### Task 7: Mobile responsiveness audit
**Requirement**: Test Lab on 375px (iPhone SE), 390px (iPhone 14), and 768px (iPad) viewports. Sidebar becomes a slide-out drawer with hamburger toggle. Tables scroll horizontally with sticky first column (player name). Toolbar wraps gracefully. No horizontal overflow on body.
**Accept when**: Lab is fully usable on all 3 viewport sizes. No horizontal body scroll. Sidebar drawer works. Tables are scrollable.
**Depends on**: none
**Size**: L

### Task 8: Performance audit and optimization
**Requirement**: Profile Lab page load time. Identify and fix: unnecessary API calls on init, render-blocking JS, unoptimized DOM operations (innerHTML in loops -> use documentFragment), duplicate event listeners, memory leaks from panel switches (clean up chart instances). Target: <2s initial load, <500ms panel switch (cached).
**Accept when**: Initial load <2s on broadband. Cached panel switch <500ms. No memory leaks on 50 consecutive panel switches. No console errors.
**Depends on**: none
**Size**: L
