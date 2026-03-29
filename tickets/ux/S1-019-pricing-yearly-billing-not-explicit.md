---
id: S1-019
severity: S1
category: ux
title: Pricing page yearly billing lacks explicit "billed annually" label
source: deep-audit
status: open
---

## Problem

Pro is $79.99/year showing "that's $6.67/mo — save 33%". Elite is $149.99/year. The per-month equivalent is shown, but there is no explicit "billed annually" or "billed as one payment" clarification. Users who think they are paying $6.67/month and then see a $79.99 charge will feel deceived.

## Root Cause

**Yearly pricing display** — `frontend/pricing.html:277-278`:
```html
$79.99<span>/yr</span>
```
Sub-text: "that's $6.67/mo — save 33%" (highlighted in orange)

**Elite yearly** — `frontend/pricing.html:301-302`: Same pattern.

**No "billed annually" label** exists on either plan's yearly view.

## Fix

Add "(billed annually at $79.99)" or "One payment of $79.99/year" below the monthly equivalent breakdown. Make the per-month equivalent the primary display with the annual total as secondary:

```
$6.67/mo
(billed annually at $79.99 — save 33%)
```

## Accept When

- Both Pro and Elite yearly plans clearly show "billed annually" or equivalent language
- The total annual charge ($79.99, $149.99) is visible before the user clicks checkout
