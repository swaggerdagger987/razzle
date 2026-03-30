---
id: DQ-376
title: Home page Pro tier claims "6 AI agents" — misleading for BYOK model
priority: P2
category: brand / copy / conversion
page: index.html
status: open
cycle: 49
---

## Problem

The home page Pro tier feature list (index.html:814) says:

> 6 AI agents, 20 queries/day — free API key (~$1-3/mo)

This implies Razzle provides 6 AI agents as part of Pro. In reality, Pro is BYOK (Bring Your Own Key) — the user must set up their own OpenRouter API key and pay their own LLM costs. The "free API key" phrasing is confusing — there's no "free" API key; the user creates one at OpenRouter and is billed separately.

The pricing page (pricing.html:282) is clearer:
> 20 AI queries/day — you provide a free API key (~$1-3/mo)

But the HOME page is the first impression. "6 AI agents, 20 queries/day" reads like "you get 6 agents included" — which is Elite, not Pro.

This is distinct from DQ-292 (pricing "same features" contradiction).

## Fix

Rewrite index.html:814 to be honest about BYOK:
```html
<li class="highlight">Situation Room: 20 queries/day — bring your own API key (~$1-3/mo)</li>
```

Or:
```html
<li class="highlight">6 AI agents with your API key — 20 queries/day (~$1-3/mo)</li>
```

The key change: make clear that the user provides the key, not Razzle.

## Verification

Read the Pro feature list on the home page. A new user should understand they need to bring their own API key for Pro.
