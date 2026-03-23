# DES-155: Mobile nav panel has no focus trap — Tab escapes to hidden content

**Priority**: P2
**Category**: Accessibility
**Affects**: app.js mobile nav — every page at 768px and below
**Cycle**: 14

## Problem

The mobile navigation panel opens as an overlay (z-index 9999) with a backdrop (z-index 9998), but doesn't trap keyboard focus. A user who opens the mobile nav and presses Tab can move focus to elements BEHIND the overlay — the main page content, hidden desktop nav links, etc. This is a WCAG 2.1 violation for modal dialogs.

The mobile nav correctly has: close button, Escape key dismiss, backdrop click dismiss, `aria-expanded` toggle, and `aria-label`. But focus trapping is the missing piece.

## Evidence

`app.js:122-278`: `_openMobileNav()` adds `.open` class and creates overlay, but does NOT:
- Set `inert` attribute on `<main>` or other content
- Implement a focus trap loop
- Move focus to the first nav link on open
- Restore focus to hamburger button on close

## Fix

When opening mobile nav:
1. Set `document.querySelector('main')?.setAttribute('inert', '')` (or equivalent aria-hidden="true" on siblings)
2. Focus the first `.mobile-nav-link` after animation completes
3. On close, remove `inert` and restore focus to hamburger button

The `inert` attribute is supported in all modern browsers and is the cleanest approach.

## Why it matters

62% of traffic is mobile per GTM report. Keyboard/screen reader users on mobile (iOS VoiceOver, Android TalkBack) will encounter this. It's also a Lighthouse accessibility flag.
