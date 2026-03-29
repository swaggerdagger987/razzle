---
id: S2-008
severity: S2
category: ux-flow
title: "About page lacks founder identity and social links"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S2-008: About page lacks founder identity

## Finding

The about page uses first-person narrative without identifying the founder. No name, photo, or social links.

## Root Cause

**File: `frontend/about.html:243`** — Tiger mascot tagline: "yep, that's me — the tiger behind the numbers"
**File: `frontend/about.html:256`** — First-person: "I built this because every fantasy tool I found was either paywalled garbage..."

No founder name, photo, Twitter/X handle, or LinkedIn. Reddit community links exist at lines 293-294 (r/DynastyFF, r/fantasyfootball) but no personal social accounts.

## Assessment

The anonymous-founder approach is intentional (mascot-as-brand). However, paying users at $80-150/year may want to know who's behind the product. Even a first name and Twitter handle would help.

## Fix

Add to the about page:
- Founder first name (even just "Built by [Name]")
- Twitter/X handle for support and community interaction
- Optional: small avatar or photo

## Impact

Trust issue for conversion. Users on the fence about paying want to know the founder is real and reachable.

## Acceptance Criteria

- [ ] About page includes founder first name
- [ ] About page includes at least one social media contact
