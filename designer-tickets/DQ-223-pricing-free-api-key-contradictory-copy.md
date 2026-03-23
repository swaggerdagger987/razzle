---
id: DQ-223
title: Pricing copy says "free API key (~$1-3/mo)" — contradictory messaging
priority: P1
category: content-accuracy
status: open
cycle: 32
---

## Problem

The Pro plan feature list says: "20 AI queries/day — you provide a free API key (~$1-3/mo)"

This is contradictory. The API key itself is free to create on OpenRouter. The $1-3/month is the *usage cost* of making LLM calls. Saying "free API key (~$1-3/mo)" reads like "free thing that costs money" — confusing and damages trust.

## Evidence

- `frontend/pricing.html:282` (approximate — in Pro feature list)

## Fix

Rewrite to be honest and clear:
```
"AI Situation Room — bring your own API key (usage ~$1-3/mo via OpenRouter)"
```
Or shorter:
```
"AI agents — BYOK, usage typically ~$1-3/mo"
```

The key distinction: the KEY is free, the USAGE costs money. Say that clearly.

## Files
- `frontend/pricing.html` (Pro plan feature list)
