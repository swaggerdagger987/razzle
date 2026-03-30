# DES-097: Form validation errors not accessible — zero role="alert", zero aria-describedby

**Priority**: P1
**Area**: Auth modal (app.js), pricing promo code (pricing.html), Sleeper connect (league-intel.html), formula publish (formula-store.js)
**Cycle**: 10

## Problem

Every form in the codebase displays validation errors visually but never announces them to screen readers. Two critical ARIA attributes are completely absent:

- **`aria-describedby`**: 0 occurrences in the entire frontend/ directory
- **`role="alert"`**: 0 occurrences in the entire frontend/ directory

This means: a screen reader user who enters wrong credentials sees nothing. A blind user who types an invalid Sleeper username gets silence. The signup and Sleeper connection flows — the two most critical conversion steps — are broken for assistive technology users.

### Affected forms

| Form | Error container | What happens on error |
|------|----------------|----------------------|
| Login (app.js:860) | `#authLoginError` | Text set, no announcement |
| Register (app.js:900) | `#authRegisterError` | Text set, no announcement |
| Promo code (pricing.html:587) | `#promoCodeFeedback` | Text + color change, no announcement |
| Sleeper connect (league-intel.html:2096) | `#connectError` | Text set, no announcement |

## Fix

For each form:

1. Add `role="alert"` to error containers so screen readers announce changes:
```html
<div id="authLoginError" class="auth-error" role="alert"></div>
```

2. Add `aria-describedby` on inputs pointing to their error container:
```html
<input id="authLoginEmail" aria-describedby="authLoginError" ...>
```

3. Set `aria-invalid="true"` on inputs when validation fails:
```javascript
emailInput.setAttribute('aria-invalid', 'true');
```

4. Clear `aria-invalid` on retry:
```javascript
emailInput.removeAttribute('aria-invalid');
```

### Files to edit
- `frontend/app.js` — auth modal creation (~line 737) + handleLogin (~860) + handleRegister (~900)
- `frontend/pricing.html` — promo input (~line 306) + validatePromoCode (~587)
- `frontend/league-intel.html` — Sleeper input (~line 1966) + connectSleeper (~2096)

## Why This Matters

Auth + Sleeper connect are the conversion funnel gates. If these don't work for screen reader users, those users can never become paying customers. WCAG 3.3.1 (Error Identification) and 4.1.3 (Status Messages) both require this.
