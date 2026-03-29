# CEO-034: Remove "(BYOK)" Jargon from Pro Feature List

**ID**: 20260321-160004-034
**Page**: Pricing (index.html + pricing.html)
**Type**: structural
**Severity**: P1
**Created**: 2026-03-21 (CEO Review #3)
**Related**: CEO-008 (BYOK explanation), CEO-020 (server-side AI for Pro)

## Problem

The Pro pricing card highlights "6 AI agents, 20 queries/day (BYOK)". "(BYOK)" is developer jargon that means nothing to a fantasy football player. Worse, if they do understand it, it means "you have to sign up for another service." This is the primary Pro selling point and it's undermined by its own description.

## BEFORE

```html
<li class="highlight">6 AI agents, 20 queries/day (BYOK)</li>
```

## AFTER (Option A — if server-side AI is built per CEO-020)

```html
<li class="highlight">6 AI agents — 5 free queries/day included</li>
```

## AFTER (Option B — if BYOK remains the only option)

```html
<li class="highlight">6 AI agents for your league (API key required)</li>
```

With a small-print note below the feature list:
```html
<p class="pricing-note-small">AI agents use OpenRouter. You bring your own API key and control your spending. <a href="/pricing.html#faq-byok">Learn more</a></p>
```

## Why

- The pricing card is a sales pitch, not a technical spec
- "(BYOK)" adds cognitive load at the exact moment the user is deciding to pay
- Even Option B (honest about API key) is better than unexplained jargon

## Acceptance Criteria

- [ ] "(BYOK)" removed from all pricing feature lists (index.html and pricing.html)
- [ ] AI feature line communicates value, not setup requirements
- [ ] If BYOK is still required, setup requirement is in secondary text (not the feature headline)
