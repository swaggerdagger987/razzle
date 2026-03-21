---
id: 20260320-170012-012
severity: P1
confidence: HIGH
flow: bureau
flow_name: Bureau — Responsive Layout for Mobile
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build responsive layout for Bureau with mobile-friendly odds cards and tabs

**PRIORITY: P1** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/DESIGN.md

The Bureau's 3-column odds grid and tab bar need to work on mobile. Cards should stack to single-column below 768px. The tab bar should become a horizontally scrollable pill bar on mobile. The hero odds number should scale down but remain prominent. Position depth cards in Self-Scout should stack vertically. All touch targets must be at least 44px.

### Task 1: Implement responsive breakpoints for Bureau
**Accept when**: Bureau renders correctly on 375px (iPhone SE), 390px (iPhone 14), and 768px (tablet) widths. Odds grid is single-column on mobile, 2-column on tablet, 3-column on desktop. Tab bar scrolls horizontally on mobile without wrapping. Hero number scales appropriately. No horizontal overflow on any viewport. Touch targets are 44px minimum.
