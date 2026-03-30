---
id: DQ-176
priority: P2
category: accessibility
status: open
cycle: 26
---

# Promo code input missing visible label element

## What's wrong

The promo code input on pricing.html has `aria-describedby="promoCodeFeedback"` but no associated `<label>` element. Screen readers may not announce the purpose of this field. The only hint is the placeholder text "promo code", which disappears on focus.

## Where

- `frontend/pricing.html:333`

## Code

```html
<input type="text" id="promoCodeInput" placeholder="promo code" autocomplete="off" spellcheck="false"
  aria-describedby="promoCodeFeedback" ...>
```

## Fix

Add an `aria-label` attribute at minimum, or a visible `<label>`:

```html
<label for="promoCodeInput" style="font-family:var(--font-mono); font-size:12px; color:var(--ink-light);">Promo Code</label>
<input type="text" id="promoCodeInput" placeholder="promo code" ...>
```

## Test

1. Use screen reader (NVDA/VoiceOver) on pricing page. Tab to promo code field. It should announce "Promo Code, text input" not just "text input".
