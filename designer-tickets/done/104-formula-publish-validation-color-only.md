# DES-104: Formula publish form validation is color-only — no error text, no ARIA

**Priority**: P2
**Area**: frontend/formula-store.js (submitPublish, ~line 350), frontend/lab.html (publish overlay, ~line 3916)
**Cycle**: 10

## Problem

The formula publish form validates required fields by changing the border color to red. That's it. No error message text. No aria-invalid. No screen reader announcement.

### Current code (formula-store.js ~line 350):

```javascript
if (!name || !description || !creator) {
  if (!name) document.getElementById("publishName").style.borderColor = "var(--red)";
  if (!description) document.getElementById("publishDescription").style.borderColor = "var(--red)";
  if (!creator) document.getElementById("publishCreator").style.borderColor = "var(--red)";
  return;
}
```

### What's wrong

1. **Color-only feedback** — red border is invisible to color-blind users (WCAG 1.4.1 violation)
2. **No error text** — user must infer the problem from a border color change
3. **No aria-invalid** — screen readers don't know which fields are invalid
4. **No error container** — there's no element to display a message at all
5. **Border color never resets** — if user fills the field and resubmits, the red border persists from a previous validation

## Fix

1. Add an error message container in lab.html publish overlay:
```html
<div id="publishError" class="auth-error" role="alert"></div>
```

2. Replace color-only validation with text + ARIA:
```javascript
if (!name || !description || !creator) {
  var missing = [];
  if (!name) { missing.push('formula name'); publishNameEl.setAttribute('aria-invalid', 'true'); }
  if (!description) { missing.push('description'); publishDescEl.setAttribute('aria-invalid', 'true'); }
  if (!creator) { missing.push('your name'); publishCreatorEl.setAttribute('aria-invalid', 'true'); }
  document.getElementById('publishError').textContent = 'missing: ' + missing.join(', ');
  return;
}
```

3. Clear errors on retry:
```javascript
['publishName', 'publishDescription', 'publishCreator'].forEach(id => {
  document.getElementById(id).removeAttribute('aria-invalid');
  document.getElementById(id).style.borderColor = '';
});
document.getElementById('publishError').textContent = '';
```

## Why This Matters

Formula publishing is the content creation path that drives community engagement. The Formula Store generates screenshots, Reddit posts, and social proof. If the publish form is broken for assistive tech users or color-blind users, that's a segment of potential contributors locked out.
