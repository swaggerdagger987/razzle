# DES-254: Zero private support contact (email/form) anywhere on site

**Priority**: P1
**Area**: about.html + sitewide
**Cycle**: 24

## Problem

The About page Contact section (lines 249-256) links only to Reddit subreddits (r/DynastyFF and r/fantasyfootball). There is no:
- Email address
- Contact form
- Support email
- Direct message channel

The pricing page mentions "DM @razzle_lol on Twitter" (line 456) for discounts, but:
1. The about page doesn't mention Twitter at all (DES-235 covers the missing handle)
2. Twitter DMs require the user to have a Twitter account
3. No private channel exists for billing/account issues

A user with a locked account (DES-227 — no forgot password), billing dispute, or API key problem has NO private way to reach support. They'd have to post publicly on Reddit.

## Evidence

- `about.html:249-256` — Contact section: only Reddit links
- `pricing.html:456` — Only Twitter mention on entire site
- No `mailto:` link in any page (`grep -r "mailto:" frontend/` = 0)
- No contact form anywhere

## Fix

1. Add a support email to the about page Contact section: `support@razzle.lol`
2. Add the same email to the pricing page near "Secured by Stripe"
3. Consider a footer link: `Support: support@razzle.lol`

## Why This Matters

Paying users ($79-149/yr) who can't reach support will chargeback through Stripe. Stripe penalizes merchants with high chargeback rates. A visible support email prevents chargebacks and builds trust at the conversion point. Additionally, DES-227 (no forgot password) means locked-out users literally cannot recover their accounts without contacting support — and there's no support to contact.
