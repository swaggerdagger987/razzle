# Ticket 020 — Pro Tier: Include 5 Server-Side AI Queries/Day

**ID**: 20260321-140002-020
**Page**: Situation Room / Pricing
**Type**: structural
**Severity**: P0
**Created**: 2026-03-21

## Problem

Pro users ($79.99/yr) must set up an OpenRouter API key to use the Situation Room. This requires:
1. Sign up for OpenRouter
2. Create an API key
3. Paste into Razzle
4. Understand rate limits and per-query costs

Estimated 80%+ of Pro users will never do this. The Situation Room — the most differentiated feature in the entire product — is effectively inaccessible to Pro subscribers.

The north star says Pro and Elite have "identical feature access" with BYOK as the only difference. In reality, BYOK means "no AI for most users." The tiers are NOT equivalent in experience.

## BEFORE

- Pro = BYOK required (most users skip) → Situation Room unused → "not worth $80" → churn
- Elite = API included → only tier that actually works
- Pro churn risk: high (premium feature inaccessible)

## AFTER

- Pro = 5 server-side AI queries/day INCLUDED, no key needed. BYOK optional for unlimited.
- Elite = unlimited server-side AI, agent memory, weekly briefings
- Every Pro user experiences the Situation Room on day 1

## Implementation Notes

- Server already has `callServerLLM` for Elite users. Extend to Pro with a 5/day rate limit.
- Track daily usage per user in the database (new column or table).
- Pro users see "4 queries remaining today" in the Situation Room UI.
- BYOK toggle still available: "Want unlimited? Add your own API key."
- Update pricing page: Pro line item changes from "6 AI agents, 20 queries/day (BYOK)" to "6 AI agents, 5 queries/day included"

## Why This Matters

This is the single highest-leverage change for Pro conversion and retention. Every Pro user who asks one question and gets a league-contextualized answer becomes a long-term subscriber. Every Pro user who hits a BYOK wall and gives up becomes a churn statistic.

## Accept When

A Pro user without an API key can type a question in the Situation Room, get a real agent response using server-side AI, and see their remaining daily quota. No setup required.
