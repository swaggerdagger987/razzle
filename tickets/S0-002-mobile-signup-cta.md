---
id: S0-002
severity: S0
category: ux-flow
title: "No visible sign-up CTA above the fold on mobile"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S0-002: No visible sign-up CTA above the fold on mobile

## Finding

The deep audit reports that on mobile (390px), the hamburger menu hides "Sign In" and the hero section has no auth CTA. First-time mobile visitors cannot find sign-up without discovering the hamburger.

## Root Cause Investigation

**Status: Already fixed in current codebase.**

The hero section in `frontend/index.html:657-665` now contains three CTA buttons:

```html
<div class="hero-cta">
  <a href="/lab.html" class="btn-hero btn-hero-primary">Open the Screener</a>
  <a href="#features" class="btn-hero btn-hero-secondary desktop-only-cta">See what's inside</a>
  <button class="btn-hero btn-hero-secondary mobile-signup-cta" onclick="if(typeof openAuthModal==='function')openAuthModal('register');">Sign Up Free</button>
</div>
```

**Responsive behavior** (index.html:145-149, inline `<style>` block):
- Desktop (>768px): "See what's inside" visible, "Sign Up Free" hidden
- Mobile (<=768px): "Sign Up Free" visible, "See what's inside" hidden

Additionally, the hamburger menu (app.js:210-221) includes a "Sign In" button in the mobile nav panel footer.

## Conclusion

This S0 has been addressed. The mobile hero shows "Sign Up Free" above the fold at <=768px. The hamburger menu also contains "Sign In" for returning users.

**Verify**: Confirm the mobile-signup-cta button is visible and functional at 390px on the live deploy.

## Acceptance Criteria

- [x] Hero section shows "Sign Up Free" button on mobile (<=768px)
- [x] Button calls `openAuthModal('register')` to open registration flow
- [ ] Verify on live deploy at razzle.lol on a 390px viewport
