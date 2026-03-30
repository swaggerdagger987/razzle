# DES-035: Elite CTA button uses inline style override on pricing page

**Priority**: P2
**Area**: pricing.html
**Impact**: The Elite plan's CTA button — the highest-value conversion action — uses inline `style=` attributes instead of CSS classes. This breaks the single-source-of-truth principle and makes the button behave differently from Pro's CTA.

## The Problem

`frontend/pricing.html` line 287:
```html
<button class="btn-primary" style="background:var(--purple); border-color:var(--ink);"
        onclick="handleCheckout('elite')">Get Elite</button>
```

The Pro CTA at line ~271 uses only `class="btn-primary"` with no inline override. The Elite CTA adds `style="background:var(--purple)"` to change the button color, mixing inline styles with class-based styling.

Additionally, JS-generated banners in pricing.html use inline styles with hardcoded `border-radius: 10px`:
- Line 715: `border-radius:10px` on subscription status banner
- Line 737: `border-radius:10px` on another status banner

These are orphaned values (should be `var(--radius)` = 12px or `var(--radius-sm)` = 8px).

## The Fix

Add a CSS class for Elite button styling:
```css
.btn-elite {
  background: var(--purple);
  border-color: var(--ink);
}
.btn-elite:hover {
  box-shadow: 3px 3px 0 var(--purple);
}
```

```html
<button class="btn-primary btn-elite" onclick="handleCheckout('elite')">Get Elite</button>
```

For JS-generated banners, use CSS variables:
```javascript
'border-radius:' + 'var(--radius)' + ';'
```

## Why This Matters

The pricing page conversion buttons must be bulletproof. Inline styles are fragile — they can't be overridden by media queries or dark mode rules without `!important`. A CSS class is testable, overridable, and visible in dev tools.
