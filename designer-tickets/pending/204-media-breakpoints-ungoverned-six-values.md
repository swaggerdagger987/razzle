# DES-204: @media breakpoints ungoverned — 6 different values across codebase

**Priority**: P3
**Category**: Design System / Responsive
**Affects**: styles.css, lab-panels.css, pricing.html, agents.html, index.html, lab.html
**Cycle**: 19

## Problem

Six different @media breakpoint values are used across the codebase with no CSS custom property governance:

| Breakpoint | Count | Where |
|-----------|-------|-------|
| `768px` | 83+ | Primary tablet — styles.css, lab-panels.css, all pages |
| `480px` | 70+ | Primary mobile — styles.css, lab-panels.css, all pages |
| `375px` | 6 | Small phone — index.html, styles.css, lab-panels.css, lab.html, pricing.html |
| `640px` | 2 | Small tablet — agents.html only |
| `900px` | 1 | Wide layout — pricing.html only |
| `600px` | 1 | Mid layout — pricing.html only |

The primary breakpoints (768px, 480px) are well-established and consistent. The issue is the 4 outliers: 375px, 640px, 900px, and 600px create one-off responsive behaviors that are difficult to test and maintain.

## Evidence

`agents.html:486`:
```css
@media (max-width: 640px) { ... }
```
No other page uses 640px. Agents page has unique responsive behavior at this width.

`pricing.html:57-58`:
```css
@media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr 1fr !important; } }
@media (max-width: 600px) { .plans-grid { grid-template-columns: 1fr !important; } }
```
Pricing page uses 900px and 600px — neither used anywhere else. This creates a 3→2→1 column cascade at unique breakpoints.

## Fix

Consolidate to 3 governed breakpoints:
- `768px` — tablet (existing, keep)
- `480px` — mobile (existing, keep)
- `375px` — small phone (keep for edge cases)

Migrate outliers:
- `640px` → `768px` (agents.html layout adjustment can happen at tablet width)
- `900px` → `768px` (pricing 3→2 column transition)
- `600px` → `480px` (pricing 2→1 column transition)

Consider defining CSS custom properties for breakpoints in a comment block at the top of styles.css for documentation.

## Why it matters

Design system governance. Scattered breakpoints mean scattered testing — QA has to check 6 widths instead of 3. Not urgent, but accumulates technical debt as more pages are added.
