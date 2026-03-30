# DES-330: Lab toolbar controls cramped and overlapping at 375px mobile

**Priority**: P1
**Category**: Mobile UX — Usability
**Affects**: frontend/lab.html toolbar at 375px width
**Cycle**: 4 (visual QA)

## Problem

At 375px mobile width, the Lab toolbar's filter dropdowns, season/week selectors, preset control, and Columns/Formulas/Filter/Tools buttons stack poorly. Controls are too small to tap reliably and some overlap or run off-screen. The toolbar is the primary interaction surface for the Screener — if it's unusable on mobile, the entire Lab is unusable on mobile.

## Evidence

Screenshot at 375x812 shows: position filter pills (ALL/QB/RB/WR/TE), search input, season/week dropdowns, preset selector, and 4 toolbar buttons all competing for ~375px of horizontal space. Multiple elements wrap into cramped rows with minimal tap targets.

## Fix

Mobile toolbar needs a dedicated layout:
1. Collapse Columns/Formulas/Filter/Tools into a single "..." overflow menu or hamburger
2. Stack season/week selectors into a single compact row
3. Make position filter pills horizontally scrollable instead of wrapping
4. Ensure all tap targets meet 44px WCAG minimum

## Why it matters

The Lab is the core product. Mobile users who can't operate the toolbar can't use the Screener at all. This is the #1 mobile usability blocker for the main feature.
