# DES-176: Pricing page FAQ section uses 100% inline styles — no CSS classes

**Priority**: P3
**Category**: Maintainability / Design System
**Affects**: pricing.html FAQ section (lines 396-445)
**Cycle**: 16

## Problem

The pricing FAQ section (9 Q&A pairs) uses zero CSS classes. Every element has inline `style="..."` with repeated font-family, font-size, color, and padding values. This means:

1. **Media queries can't resize text** — the FAQ questions are 14px and answers are 12px. On 375px mobile (smallest supported breakpoint), 12px mono text is difficult to read. No CSS class = no `@media` hook to increase size.
2. **Design system updates won't propagate** — if the type scale changes, these 36 inline style strings need manual updates.
3. **Code repetition** — the same 4 style properties are repeated 18 times (9 questions + 9 answers).

## Evidence

`pricing.html:400-402`:
```html
<div style="border-bottom:2px dashed var(--ink-faint); padding:16px 0;">
  <div style="font-family:var(--font-mono); font-size:14px; color:var(--ink); margin-bottom:6px;">What's the difference between Pro and Elite?</div>
  <div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); line-height:1.7;">Same features...</div>
</div>
```

This pattern repeats 9 times with identical inline styles.

## Fix

Create CSS classes and move styles out of inline:
```css
.faq-item { border-bottom: 2px dashed var(--ink-faint); padding: 16px 0; }
.faq-question { font-family: var(--font-mono); font-size: 14px; color: var(--ink); margin-bottom: 6px; }
.faq-answer { font-family: var(--font-mono); font-size: 12px; color: var(--ink-medium); line-height: 1.7; }

@media (max-width: 480px) {
  .faq-answer { font-size: 13px; }
}
```

## Why it matters

The pricing page is the #1 conversion page. The FAQ section answers objections. On mobile (62% of traffic from Twitter/Reddit), 12px mono text is the smallest readable size. CSS classes enable responsive sizing, dark mode targeting, and design system consistency.
