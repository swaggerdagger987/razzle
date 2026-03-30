# DES-327: Situation Room hero section on light sand background — should be fully dark

**Priority**: P0
**Category**: Design System Violation — Brand Identity
**Affects**: frontend/agents.html — the entire Situation Room page
**Cycle**: 4 (visual QA)

## Problem

The Situation Room page (agents.html) has a jarring light-to-dark split. The top half — tiger mascot, "THE SITUATION ROOM" heading, agent name chips, and 6 agent bio cards — sits on the normal sand/light background. Only the warroom canvas container below is forced dark via `.warroom-dark`.

DESIGN.md is explicit: **"Situation Room uses `--bg-ink` (deepest espresso `#1a110a`) regardless of theme toggle. It's always dark."**

## Evidence

- `.warroom-hero` class (line 30) has no background override — inherits page sand `#ede0cf`
- `.warroom-dark` class (line 214) correctly forces dark, but only wraps the pixel canvas section
- Everything above `.warroom-dark` (hero, agent bios, scenario chips) is on light background
- Screenshot confirms: agent bio cards with cream `--bg-card` backgrounds on sand page

## Fix

Force the entire `<body>` or a page-level wrapper on agents.html to use dark mode:

```css
body { background: var(--bg-ink, #1a110a); color: var(--ink, #ede0cf); }
```

Or wrap all content in a single `.warroom-dark` container and move agent bio cards inside it. All text, card backgrounds, and borders need dark-mode values.

## Why it matters

The Situation Room is supposed to feel like walking into an intelligence command center — dark, focused, serious. Having the top half on cheerful sand completely undermines that atmosphere. This is the single biggest design violation visible on the site.
