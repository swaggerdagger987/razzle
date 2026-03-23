# DES-187: about.html has ZERO dark mode CSS overrides

**Priority**: P1
**Category**: Dark Mode / Conversion Support
**Affects**: about.html — product evaluation page
**Cycle**: 18

## Problem

about.html has literally zero `[data-theme="dark"]` CSS rules. Every other main page (index, lab, pricing, agents, league-intel) has dark mode overrides, but about.html was missed entirely.

Users evaluating the product visit this page to understand what Razzle is, read the privacy policy, and find contact info. In dark mode, the page has broken contrast — `.about-section` cards, heading borders, data source cards, and body text all render with light-mode assumptions on a dark background.

## Evidence

Grep for `data-theme.*dark` in about.html returns **0 matches**.

Compare:
- index.html: 20+ dark mode rules
- pricing.html: 15+ dark mode rules
- about.html: **0 dark mode rules**

The `<style>` block (lines 28-176) defines ~50 selectors with colors like `var(--bg-card)`, `var(--ink-faint)`, `var(--ink-light)` that all resolve correctly via CSS vars. But page-specific selectors like `.about-section h2` with `border-bottom: 2px dashed var(--ink-faint)` will be near-invisible in dark mode (faint on faint).

## Fix

Add dark mode overrides in about.html's `<style>` block:
```css
[data-theme="dark"] .about-section { border-color: var(--ink-faint); }
[data-theme="dark"] .about-section h2 { border-bottom-color: var(--ink-faint); }
[data-theme="dark"] .data-source-card { border-color: var(--ink-faint); }
[data-theme="dark"] .about-hero-mascot { filter: drop-shadow(3px 3px 0 rgba(237,224,207,0.15)); }
```

Most colors already use CSS vars that flip automatically — only border/shadow colors need explicit overrides.

## Why it matters

about.html is on the evaluation path. A user deciding whether to trust Razzle with their data clicks "About" and sees a broken page in dark mode. Power users (primary audience) use dark mode. This is a credibility gap on the trust page.
