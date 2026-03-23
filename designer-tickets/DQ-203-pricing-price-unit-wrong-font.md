---
id: DQ-203
priority: P2
category: typography
status: open
---

# Price unit "/yr" uses display font instead of Space Mono

## Problem

The pricing cards show prices like `$79.99/yr`. The dollar amount correctly uses `--font-display` (Luckiest Guy), but the `/yr` unit span inherits the same display font. Per DESIGN.md, stat values and data units should use Space Mono: "Space Mono — All stat values, evidence blocks, timestamps."

A price period (`/yr`) is factual data, not a playful heading. Luckiest Guy at 16px for "/yr" looks cartoonish and undermines the seriousness of a payment decision.

## Evidence

pricing.html line 105-106:
```css
.plan-price { font-family: var(--font-display); font-size: 36px; }
.plan-price span { font-size: 16px; color: var(--ink-light); }
```

The `span` element inherits `--font-display` from `.plan-price` — no font override.

pricing.html line 277:
```html
<div class="plan-price" id="proPrice">$79.99<span>/yr</span></div>
```

## Fix

Add `font-family: var(--font-mono)` to `.plan-price span`:

```css
.plan-price span { font-family: var(--font-mono); font-size: 13px; color: var(--ink-light); }
```

## Files
- `frontend/pricing.html` line 106
