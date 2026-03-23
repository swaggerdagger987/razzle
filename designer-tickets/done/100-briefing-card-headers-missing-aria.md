# DES-100: Briefing card headers missing role="button" + aria-expanded + keyboard handler

**Priority**: P1
**Area**: warroom.js (lines 3241-3281, 4041-4050)
**Cycle**: 10

## Problem

Briefing card headers in the Situation Room are collapsible sections rendered as plain `<div onclick>` elements. They lack:

1. **`role="button"`** — screen readers announce them as generic containers, not interactive
2. **`aria-expanded="true|false"`** — no indication of collapsed/expanded state
3. **`tabindex="0"`** — not keyboard-focusable
4. **Keyboard handler** — Enter/Space don't toggle the card; only mouse click works

### Current code (warroom.js ~line 3241):

```javascript
'<div class="briefing-card-header" onclick="toggleBriefingCard(this)">'
```

### toggleBriefingCard (~line 3273):

```javascript
function toggleBriefingCard(el) {
  var body = el.nextElementSibling;
  body.classList.toggle('collapsed');
  // No aria-expanded update
}
```

The same pattern appears in demo briefing cards (~line 4041).

## Fix

1. Add ARIA attributes in renderBriefingCard and renderFollowUpCard:

```javascript
'<div class="briefing-card-header" role="button" tabindex="0" aria-expanded="true" onclick="toggleBriefingCard(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleBriefingCard(this);}">'
```

2. Update toggleBriefingCard to sync aria-expanded:

```javascript
function toggleBriefingCard(el) {
  var body = el.nextElementSibling;
  body.classList.toggle('collapsed');
  var expanded = !body.classList.contains('collapsed');
  el.setAttribute('aria-expanded', String(expanded));
}
```

3. Apply the same fix to demo briefing card headers (~line 4041).

## Why This Matters

The Situation Room is the conversion destination for Pro/Elite users. The briefing cards are the primary output — the analysis they're paying for. If these can't be operated by keyboard or announced by screen readers, the product's premium feature is inaccessible.
