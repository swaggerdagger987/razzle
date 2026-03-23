# DES-281: agents.html CTA buttons hardcode yearly interval

**Priority**: P1
**Page**: agents.html (Situation Room)
**Affects**: Users who prefer monthly billing

## Problem

The Situation Room pricing cards (lines 1931, 1951) hardcode `startCheckout('pro_year')` and `startCheckout('elite_year')`. Users who prefer monthly billing ($9.99/mo or $19.99/mo) can ONLY get monthly pricing from pricing.html.

Two of three conversion surfaces (home page DES-262, agents page THIS ticket) force yearly-only checkout. Only pricing.html has the interval toggle.

The agents page even SHOWS monthly pricing text ("or $9.99/month" at line 1921, "or $19.99/month" at line 1941) — but clicking the CTA always starts a yearly checkout. Users see a monthly option but can't select it.

## Evidence

```html
<!-- agents.html line 1931 -->
onclick="if(typeof startCheckout==='function'){startCheckout('pro_year')}"

<!-- agents.html line 1951 -->
onclick="if(typeof startCheckout==='function'){startCheckout('elite_year')}"
```

## Fix

Option A (minimal): Add a note below each CTA: "or $9.99/mo — see pricing" linking to /pricing.html.
Option B (better): Add a small monthly/yearly toggle on the agents page pricing section, matching pricing.html's pattern.

Option A is the fast fix. Option B provides parity.

## Why This Matters

Showing "$9.99/month" then charging $79.99/year creates a trust gap at the conversion moment. Monthly-preference users bounce to pricing.html (extra step) or assume there's no monthly option and leave. Every lost conversion on the Situation Room page — where users just saw the agents in action — is the highest-intent conversion lost.
