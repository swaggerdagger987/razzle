# DES-222: lab-panels.js search inputs missing aria-label (8+ inputs)

**Priority**: P2 (Accessibility — screen readers announce unlabeled inputs)
**Page**: lab.html (via lab-panels.js)
**Category**: Accessibility / ARIA

## The Problem

The `searchWrapHTML()` helper function in lab-panels.js (line 5510-5514) generates search inputs with only a `placeholder` attribute for identification — no `aria-label`:

```javascript
function searchWrapHTML(prefix, placeholder) {
    return '<div class="' + prefix + 'search-wrap lp-search-wrap">' +
      '<input type="text" class="' + prefix + 'search-input lp-search" placeholder="' + (placeholder || 'search player...') + '">' +
      '<div class="' + prefix + 'search-list lp-search-list"></div>' +
    '</div>';
}
```

8+ individual search inputs also lack `aria-label`:
- line 114: `lp-rankings-search`
- line 192: `lp-dh-compare-input`
- line 451: `lp-tl-search`
- line 593: `lp-tv-search`
- line 871: `lp-vorp-search`
- line 1189: `lp-av-search`
- line 8506: `rbld-search`

Placeholder text is NOT a substitute for `aria-label` — it disappears on focus and is not consistently announced by all screen readers.

## Evidence

Compare: standalone pages like breakdown.html:365 CORRECTLY include `aria-label="Player search"` on their search inputs. The lab-panels.js search inputs in the flagship Lab product don't.

DES-190 covers search inputs in HTML files. This ticket covers JS-generated search inputs in lab-panels.js specifically.

## The Fix

Add `aria-label` parameter to `searchWrapHTML()`:
```javascript
function searchWrapHTML(prefix, placeholder, ariaLabel) {
    return '<div class="' + prefix + 'search-wrap lp-search-wrap">' +
      '<input type="text" class="' + prefix + 'search-input lp-search" placeholder="' + (placeholder || 'search player...') + '" aria-label="' + (ariaLabel || 'Search players') + '">' +
      ...
}
```

And add `aria-label` to the 8 individual inputs.

## Why This Matters

The Lab is the flagship product. These search inputs are core interactions on panels like Dynasty Rankings, Trade Values, and VORP — all conversion-driving features. Keyboard-only and screen reader users hitting unlabeled inputs is a gap in the product's accessibility story.
