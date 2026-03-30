# DES-264: About page Contact section has no direct contact method

**Priority:** P1
**Category:** Conversion / Trust
**Affects:** about.html (lines 248-256)
**Cycle:** 25

## Problem

The about.html Contact section says: "Found a bug? Have a feature request?" Then lists:
- Reddit: r/DynastyFF and r/fantasyfootball
- Domain: razzle.lol

That's it. No email. No contact form. No Twitter handle. No Discord. No direct way to reach the team.

A user with a billing issue, locked account, or bug to report must:
1. Go to Reddit
2. Find Razzle's posts
3. Hope they reply

DES-254 covers the broader "zero support contact sitewide" issue. DES-235 covers "about page missing Twitter." But this ticket is specific: the Contact section — the ONE place users go for help — has no actionable contact method.

## Why This Matters

Stripe compliance requires accessible support contact. Users who can't reach you don't renew. The pricing page mentions "DM @razzle_lol on Twitter" for student/military discounts — but the about page Contact section (linked from every footer) doesn't mention Twitter at all.

## Fix

Update about.html Contact section to include:
```html
<li>Twitter: <a href="https://twitter.com/razzle_lol" target="_blank" rel="noopener">@razzle_lol</a> (DMs open)</li>
<li>Email: <a href="mailto:support@razzle.lol">support@razzle.lol</a></li>
```

If no email is set up yet, at minimum add the Twitter handle (the account exists per Phase 1).

## Scope

about.html — 2 lines in the Contact `<ul>`.
