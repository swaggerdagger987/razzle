# DES-154: Upgrade gate modal has no role="dialog" or focus management

**Priority**: P2
**Category**: Accessibility / Conversion
**Affects**: lab.html `_showUpgradeGate()` — shown every time a free user clicks a locked panel
**Cycle**: 14

## Problem

The upgrade gate overlay (shown when free users click Pro-locked panels) is dynamically generated with zero accessibility attributes. It has no `role="dialog"`, no `aria-modal`, no `aria-labelledby`, and no focus management. The "See Plans" CTA inside the gate doesn't receive focus automatically.

This is a CONVERSION-PATH element — it's the modal that convinces free users to upgrade. It's seen by every free user who explores locked panels.

## Evidence

`lab.html:4377-4398` — `_showUpgradeGate()` creates a `<section>` with:
- No `role="dialog"` or `aria-modal="true"`
- No `aria-labelledby` pointing to the heading
- No focus trap (Tab escapes to sidebar/screener behind it)
- "See Plans" link not auto-focused
- No Escape key handler to dismiss

Compare with the auth modal in lab.html which correctly uses `role="dialog"` + `aria-modal` + `aria-labelledby`.

## Fix

Add to the gate container:
```javascript
gate.setAttribute('role', 'dialog');
gate.setAttribute('aria-modal', 'true');
gate.setAttribute('aria-labelledby', 'upgrade-gate-title');
```
Add `id="upgrade-gate-title"` to the heading div. Auto-focus the "See Plans" link after render. Add Escape key to dismiss (return to screener panel).

## Why it matters

This is the upgrade conversion moment. A keyboard user who can't tab to "See Plans" or a screen reader user who doesn't hear "X is a Pro panel" misses the upgrade prompt entirely. This directly impacts the 1,000-user goal.
