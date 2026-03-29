---
id: S1-006
severity: S1
category: ux-flow
title: "Pricing page monthly vs yearly billing clarification"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: RESOLVED (pricing.html:277-278 has "billed annually" clarification)
---

# S1-006: Pricing page monthly vs yearly math may confuse users

## Finding

The deep audit says the per-month equivalent ($6.67/mo for Pro, $12.50/mo for Elite) could confuse users about actual billing.

## Root Cause Investigation

**Status: Already addressed in current code.**

**File: `frontend/pricing.html:277-278` (Pro), `301-302` (Elite)**

The pricing page already includes "billed annually" clarification:

```html
<!-- Pro -->
<div class="plan-price">$79.99<span>/yr</span></div>
<div class="plan-interval">that's <span class="yearly-price">$6.67/mo</span> — save 33%
  <br><span style="font-size:11px;color:var(--ink-light);">billed annually at $79.99</span>
</div>

<!-- Elite -->
<div class="plan-price">$149.99<span>/yr</span></div>
<div class="plan-interval">that's <span class="yearly-price">$12.50/mo</span> — save 37%
  <br><span style="font-size:11px;color:var(--ink-light);">billed annually at $149.99</span>
</div>
```

The "billed annually at $X" note is present but at 11px font size — could be more prominent.

## Minor Enhancement (Optional)

- Increase "billed annually" text from 11px to 12-13px
- Consider making it a separate visible line rather than a tiny sub-note

## Acceptance Criteria

- [x] "Billed annually at $X" clarification is present
- [ ] Verify on live deploy that the clarification is readable
