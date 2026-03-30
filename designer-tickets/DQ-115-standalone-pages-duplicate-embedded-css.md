# DQ-115: Standalone pages duplicate 250-370 lines of embedded CSS each

**Priority**: P2 (maintainability / design drift risk)
**Category**: CSS Architecture
**Severity**: Medium — identical CSS skeleton copy-pasted across 60+ files

## Problem

Every standalone panel page (breakouts.html, rankings.html, tradevalues.html, dashboard.html, etc.) embeds its own `<style>` block with 250-370 lines of CSS. The first ~30 lines of every page are an identical skeleton:

```css
.X-page { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }
.X-header { text-align: center; margin-bottom: 24px; }
.X-header h1 { font-family: var(--font-display); font-size: 32px; color: var(--ink); }
.X-subtitle { font-family: var(--font-hand); ... }
/* position filter buttons, table styles, card styles, responsive breakpoints... */
```

Only the class prefix changes (`.breakouts-`, `.rankings-`, `.tv-`, `.db-`). The pattern, values, and responsive breakpoints are identical.

### Evidence (line counts)

| Page | Embedded CSS lines |
|------|-------------------|
| buysell.html | 371 |
| tradevalues.html | 368 |
| breakouts.html | 318 |
| airyards.html | 293 |
| dashboard.html | 289 |
| rankings.html | 263 |
| aging.html | 261 |
| weekly.html | 249 |

**76 files** have `<style>` blocks. Estimated ~18,000 lines of embedded CSS total, with ~40% being duplicated patterns.

## Fix

Extract the shared skeleton into `styles.css` as utility classes:

```css
.panel-page { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }
.panel-header { text-align: center; margin-bottom: 24px; }
.panel-header h1 { font-family: var(--font-display); font-size: 32px; color: var(--ink); margin: 0 0 4px; }
.panel-subtitle { font-family: var(--font-hand); font-size: 18px; color: var(--ink-light); }
.panel-controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
```

Then each page's `<style>` block drops from 300+ lines to ~100 (only page-specific styles). Any design change to shared patterns needs one edit, not 60+.

## Not a duplicate of

- DQ-066 (max-width inconsistency) — about inconsistent max-width VALUES. This is about the DUPLICATION MECHANISM.
- DQ-113 (watermark inline style) — about one specific repeated element. This is about the entire page CSS skeleton.
