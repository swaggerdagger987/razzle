---
id: DQ-175
priority: P1
category: accessibility
status: open
cycle: 26
---

# Pricing interval toggle not keyboard focusable

## What's wrong

The Monthly/Yearly pricing toggle on pricing.html uses `<label>` elements with `onclick` handlers but no `tabindex`, no keyboard event handlers, and no proper ARIA roles. Keyboard-only users cannot:
- Tab to the Monthly/Yearly labels
- Press Enter/Space to toggle
- Know which option is currently selected (no aria-checked)

The toggle track div has `role="switch"` and `aria-checked`, which is good, but the labels themselves are not in the tab order.

## Where

- `frontend/pricing.html:236-240`

## Code

```html
<label id="monthlyLabel" onclick="setPricingInterval('month')">Monthly</label>
<div class="toggle-track yearly" id="intervalToggle" onclick="toggleInterval()" role="switch" aria-checked="true" aria-label="Toggle yearly pricing" tabindex="0">
  <div class="toggle-thumb"></div>
</div>
<label id="yearlyLabel" class="active" onclick="setPricingInterval('year')">Yearly</label>
```

## Fix

1. Add `tabindex="0"` and `role="button"` to both labels
2. Add `onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setPricingInterval('month')}"` (and 'year' for the other)
3. Add `aria-pressed` to indicate current selection state
4. Or better: convert to a proper `<fieldset>` with radio inputs that are visually hidden, letting the labels act as styled radio buttons (native keyboard support)

## Test

1. Tab through pricing page. Monthly and Yearly labels should receive focus.
2. Press Enter on Monthly label. Prices should switch to monthly.
3. Screen reader should announce "Monthly, button" or "Monthly, radio button, selected".
