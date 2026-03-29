---
id: S2-109
severity: S2
confidence: HIGH
category: ux
source: DQ-244+247+250+269+350+357+358+418+419+420+479
status: OPEN
---

# Pricing page conversion gaps — unclear differentiation, no social proof

## Problems

1. **Zero social proof** (DQ-244) — No testimonials, user count, Reddit mentions, or trust signals. Page asks for money with nothing to back it up.
2. **7-day trial CTA buried below comparison table** (DQ-247) — Primary conversion action hidden below the fold. Users who scroll down to compare features must scroll back up to act.
3. **Feature descriptions terse** (DQ-250) — Feature list items like "CSV Export" and "Custom Scoring" have no tooltip or context explaining what they actually do.
4. **Price jumps abruptly on Monthly/Yearly toggle** (DQ-269) — No transition animation. Prices snap from $14.99 to $9.99 with no visual acknowledgment of savings.
5. **Promo cards no expiration check** (DQ-350) — Early adopter / lifetime deal cards have no client-side expiration. If the API is stale, sold-out deals still show as available.
6. **Stripe error says "ping support" with no link** (DQ-357) — On checkout failure, error message mentions "support" but provides no email or link.
7. **Pro vs Elite use identical checkmarks** (DQ-358) — Feature matrix shows same checkmark for both tiers. Visual difference between Pro and Elite unclear.
8. **FAQ missing 3 common questions** (DQ-418) — No answers for "Can I cancel anytime?", "What happens after trial?", "Do you offer refunds?"
9. **"Generic AI queries" unexplained** (DQ-419) — Feature row doesn't explain what "generic" means vs regular queries.
10. **Free tier comparison undersold** (DQ-420) — "Compare up to 4 players" listed as Pro, but Free tier allows 2 — this isn't mentioned.
11. **Color-coded table with no legend** (DQ-479) — Comparison table uses green/gray/red with no key.

## Files

- `frontend/pricing.html` — all issues

## Acceptance Criteria

1. Social proof section visible (user count, Reddit mentions, or testimonial)
2. Trial CTA visible above the fold
3. Feature descriptions have tooltips or one-line explanations
4. Pro vs Elite visually differentiated (Elite gets star/premium checkmark)
5. FAQ includes cancel, post-trial, and refund questions
6. Stripe error includes support email
