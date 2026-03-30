# DES-164: league-intel.html email input missing `autocomplete="email"`

**Priority**: P2 (Conversion UX — Bureau connection flow)
**Page**: league-intel.html (Bureau of Intelligence)
**Category**: Form UX

## The Problem

The email input on the Bureau connection page (league-intel.html) lacks the `autocomplete` attribute. On mobile, this means:
- No email keyboard layout (@ key not prominent)
- No autofill suggestions from saved email addresses
- Extra typing friction at the exact moment we want frictionless conversion

The Bureau is the conversion engine. Connecting a Sleeper account is the bridge from "cool free tool" to "I need this." Any friction in this flow costs conversions.

## Evidence

- **league-intel.html line ~1983**: `<input type="email" ...>` — no `autocomplete` attribute
- **Contrast**: Auth modal inputs (app.js) already use correct autocomplete hints
- **agents.html**: API key inputs have `autocomplete="off"` (intentionally disabled — correct)

## The Fix

Add `autocomplete="email"` to the email input:
```html
<input type="email" autocomplete="email" ...>
```

Also audit other form inputs on the page for missing autocomplete attributes (username fields should have `autocomplete="username"`).

## Why This Matters

62%+ of traffic is mobile from Twitter/Reddit. Mobile users filling out forms without autocomplete hints type slower and make more errors. The Sleeper connection flow should be as close to one-tap as possible. This is a single attribute addition with direct UX impact on the conversion path.
