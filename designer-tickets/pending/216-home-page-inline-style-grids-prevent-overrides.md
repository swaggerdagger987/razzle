---
id: DES-216
title: Home page 4+ inline-style grids prevent media query and dark mode overrides
priority: P3
category: design-system
page: index.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

Four layout sections on the home page use inline `style` attributes for grid/flex layouts instead of CSS classes. Inline styles have the highest CSS specificity — they can't be overridden by `@media` queries or `[data-theme="dark"]` selectors without `!important`.

## Evidence

index.html:
1. Feature grid (line 691): `style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-top:24px; text-align:left;"`
2. Discovery chips (line 719): `style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:16px;"`
3. Social proof grid (line 732): `style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-top:20px; text-align:left;"`
4. Mini-screener tabs (line 656): `style="display:flex; gap:0; border-bottom:3px solid var(--ink);"`

pricing.html has the same pattern extensively (DES-196 covers pricing; this covers home page).

## Why it matters

If any grid needs mobile-specific column adjustment (e.g., forcing 1 column at 480px when auto-fit would still show 2 cramped columns), there's no way to do it without either:
1. Adding `!important` (specificity war)
2. Changing the HTML (deploy required for a CSS-level change)

The pricing page plan-grid already hit this (DES-188: inline grid-template-columns defeats responsive CSS).

## Fix

Extract inline grid/flex declarations into named CSS classes in the index.html `<style>` block:

```css
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; text-align: left; }
.discovery-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
.social-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 20px; text-align: left; }
.mini-screener-tabs { display: flex; gap: 0; border-bottom: 3px solid var(--ink); }
```

## Scope

index.html — 4 inline style extractions into CSS classes. ~20 lines.
