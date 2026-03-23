---
id: DQ-060
priority: P3
category: typography
page: index.html
status: open
---

# Home page pricing section subtitle uses inline Caveat for selling copy

## What's wrong

The pricing section subtitle (line 787) uses an inline style to force Caveat on primary selling copy:

```html
<p style="font-family:var(--font-hand); font-size:20px; color:var(--ink-medium); margin-bottom:4px;">
  No account. No catch. No trial that expires. Pro and Elite add the intelligence layer.
</p>
```

This is the same type of violation as DQ-052 (Caveat on primary content) but worth noting separately because:
1. It uses an **inline style** instead of a CSS class — harder to maintain and override
2. "No account. No catch. No trial that expires." is a TRUST signal — core selling copy
3. The inline style bypasses any CSS class fixes made for DQ-052

## Evidence

- index.html line 787: `style="font-family:var(--font-hand);"` on a `<p>` tag
- Content is conversion-critical trust messaging
- DESIGN.md line 123: "Caveat is never primary information"

## Fix

Remove the inline style and apply a CSS class:
```html
<p class="pricing-sub">No account. No catch. No trial that expires. Pro and Elite add the intelligence layer.</p>
```
```css
.pricing-sub { font-family: var(--font-mono); font-size: 15px; color: var(--ink-medium); }
```

## Files
- `frontend/index.html` (line 787)
