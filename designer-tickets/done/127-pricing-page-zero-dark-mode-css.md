# DES-127: Pricing page has zero dark mode CSS rules

**Priority:** P1 — Conversion Blocker
**Component:** pricing.html
**Affects:** Every dark mode user on the #1 conversion page

## Problem

The pricing page (`pricing.html`) has ZERO `[data-theme="dark"]` CSS rules. When a user toggles dark mode (available site-wide per DESIGN.md), the pricing page's inline styles for plan cards, free celebration box, feature matrix, interval toggle, and FAQ all retain light-mode colors. Text becomes unreadable, backgrounds clash, and the page looks broken.

This is the most important conversion page in the funnel — users arrive here from home page CTAs, and a broken dark mode says "this product isn't finished."

## Evidence

- `grep -c 'data-theme.*dark' frontend/pricing.html` → **0 results**
- Inline styles on `.free-celebration`, `.plan-card`, `.plans-grid`, `.matrix-section`, `.faq-item` all use `var(--bg-card)` and `var(--ink)` which DO flip in dark mode via styles.css — but additional elements use hardcoded light-mode assumptions
- `.save-badge`, `.free-chip`, plan card backgrounds, feature matrix `td` colors — none tested for dark mode contrast
- Compare: `index.html` has dark mode rules, `lab.html` has dark mode rules, `pricing.html` has **none**

## Fix

Add `[data-theme="dark"]` overrides in pricing.html's `<style>` block for:
1. `.plan-card` background and border colors
2. `.free-celebration` background and border
3. `.feature-matrix td` backgrounds and text
4. `.save-badge` and `.free-chip` backgrounds
5. `.faq-item` backgrounds
6. `.interval-toggle` button active/inactive states
7. Any `background: var(--bg-card)` elements that need dark mode contrast

## Why it matters

Dark mode is a power-user feature. Dynasty power users (primary audience) disproportionately use dark mode. A broken pricing page in dark mode = "this product is half-baked" = bounce.
