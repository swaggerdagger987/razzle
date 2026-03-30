# DES-234: Pricing page sections have no id attributes for deep linking

**Priority:** P2 — UX / shareability
**Page:** pricing.html
**Cycle:** 22

## Problem

The pricing page has three distinct sections that users want to link to directly:
1. Feature comparison matrix (line 341) — no id
2. FAQ section (line 396) — no id
3. Free celebration section (line 245) — no id

Users can't share links to specific sections. When someone on Reddit asks "what's the difference between Pro and Elite?", linking `/pricing.html#faq` or `/pricing.html#comparison` would be ideal. Currently, only `/pricing.html` works — landing at the top.

This also blocks DES-232 (feature comparison anchor from home page).

## Fix

Add id attributes to the three key sections:

```html
<div class="matrix-section" id="comparison">   <!-- line 341 -->
<div class="matrix-section" id="faq" ...>      <!-- line 396 -->
<div class="free-celebration" id="free" ...>   <!-- line 245 -->
```

Also requires scroll-margin-top to account for the sticky nav (see DES-182 for the sitewide fix).

## Why this matters

The pricing page is the conversion page. When users share it in group chats, Reddit comments, or league Discord, deep links to specific sections answer specific questions. Every unanswered question is a lost conversion.
