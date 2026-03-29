---
id: S3-080
severity: S3
confidence: MEDIUM
category: mobile
source: DQ-181+182+188+213+265+214+215+259
status: OPEN
---

# Mobile polish batch — browser spinners, scroll-margin, overflow, and platform detection

## Root Cause

Multiple mobile-specific issues:

1. **Number inputs show browser spinners** — sitewide: `<input type="number">` shows native spinner controls that conflict with design (DQ-181)
2. **No scroll-margin-top** — sitewide: anchor targets covered by sticky nav after jump scroll (DQ-182)
3. **Pricing upgrade grid inline defeats mobile** — `frontend/pricing.html`: inline grid styles can't be overridden by mobile media queries (DQ-188)
4. **overflow-x:hidden masks bugs** — sitewide: `overflow-x: hidden` on body hides horizontal scroll issues instead of fixing them (DQ-213)
5. **Pricing FAQ not collapsible** — `frontend/pricing.html`: FAQ section takes full vertical space on mobile, should be accordion (DQ-265)
6. **Safari VoiceOver strips list semantics** — sitewide: `list-style: none` causes VoiceOver to not announce lists (DQ-214)
7. **Search hint Ctrl+K not Cmd+K on Mac** — `frontend/app.js`: keyboard hint shows Ctrl+K on macOS instead of Cmd+K (DQ-215)
8. **No native share API** — sitewide: mobile users can't use native share sheet; only clipboard copy (DQ-259)

## Fix

- Hide number input spinners: `input[type=number]::-webkit-inner-spin-button { display: none; }`
- Add `scroll-margin-top: 80px` to anchor targets
- Move inline grid to CSS class
- Add collapsible `<details>/<summary>` to FAQ
- Add `role="list"` to `list-style: none` elements for VoiceOver
- Detect macOS: `navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'`
- Add `navigator.share()` with clipboard fallback

## Files

- `frontend/styles.css` — spinner hide, scroll-margin, list role
- `frontend/pricing.html` — grid, FAQ accordion
- `frontend/app.js` — platform detection, share API
- Sitewide — scroll-margin-top

## Acceptance Criteria

- Number inputs don't show native spinners
- Anchor links don't hide behind sticky nav
- FAQ collapsible on mobile
- Keyboard hint platform-aware
