---
id: DQ-374
title: Home page uses .pricing-card class while pricing.html uses .plan-card — parallel CSS for same element
priority: P2
category: design-system / consistency
page: index.html, pricing.html
status: open
cycle: 49
---

## Problem

The pricing cards on the home page and pricing page use completely different CSS class hierarchies:

**Home page** (index.html):
- `.pricing-card` (inline `<style>` block, line 487)
- `.pricing-card--highlight` (line 499)
- `.pricing-card--elite` (line 504)
- `.pricing-badge` (line 510)
- `.pricing-list` (line 535)

**Pricing page** (pricing.html):
- `.plan-card` (inline `<style>` block, line 84)
- `.plan-badge` (line 105)
- Dark mode overrides at lines 169-183

When a visual fix is made to `.plan-card` on the pricing page (e.g., dark mode, hover state, border-radius), it does NOT propagate to `.pricing-card` on the home page. They drift independently.

## Evidence

- `index.html:487-550`: Complete `.pricing-card` CSS hierarchy
- `pricing.html:84-165`: Complete `.plan-card` CSS hierarchy
- `pricing.html:169-183`: Dark mode overrides for `.plan-card` (home page has NONE)

## Fix

Consolidate to one class. Move the pricing card styles to `styles.css` as a shared `.plan-card` component, then update both pages to use the same class.

1. Add `.plan-card` styles to `styles.css` (from pricing.html)
2. Replace `.pricing-card` in index.html with `.plan-card`
3. Remove duplicate CSS from both inline `<style>` blocks

## Verification

Open home page and pricing page side by side. Cards should look identical. Toggle dark mode — both should respond correctly.
