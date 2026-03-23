---
id: DES-356
priority: P2
area: index.html
section: hero CTA
type: ux / copy / conversion
status: open
---

# Hero CTA copy doesn't reinforce "no account required" message

## What's wrong

The hero section creates a trust promise:

> h1: "The fantasy football research lab. Forever free."
> sub: "100+ stat columns. Custom formulas. Shareable views. No account required. No catch."

But the primary CTA button says: **"Open the Screener"**

The button text doesn't reinforce the trust signal. A user reads "no account required" and then sees a generic "Open" button — the connection between "free, no signup" and the CTA is implicit, not explicit.

Compare to other tools: "Start free — no account needed" or "Try it now (no signup)" — these CTAs explicitly close the trust loop.

## Where

- `frontend/index.html` line 645: hero sub "No account required. No catch."
- `frontend/index.html` line 647: CTA `<a href="/lab.html" class="btn-hero btn-hero-primary">Open the Screener</a>`

## Suggested fix

Change the CTA text to reinforce the "no account" promise:

Option A: "Open the Screener — no signup"
Option B: "Start exploring (free, no account)"
Option C: Keep "Open the Screener" but add a micro-copy line below: `<span class="hero-cta-sub">no signup needed</span>`

The secondary CTA "See what's inside" is fine as-is.

## Not a dupe of

- DES-130 (hero CTAs missing focus-visible) — that's about keyboard accessibility
- DES-179 (home CTA buttons complex inline onclick) — that's about the pricing CTAs, not hero
- DES-244 (massive inline onclick) — same, pricing section

## Why this matters

The hero is the highest-traffic section of the highest-traffic page. Every word matters. The trust promise ("no account") should be closed by the CTA, not left hanging. This is standard SaaS conversion psychology — make the next step feel safe.
