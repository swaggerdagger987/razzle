# S2-014: Stripe checkout return shows vague "processing..." for 20 seconds

**Severity**: S2 (Medium)
**Category**: ux-flow
**Source**: EDGE-CASES.md #29
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:484-521` — After Stripe payment, the app polls `/api/auth/me` every 2 seconds for up to 10 attempts (20 seconds total). During this time, a single toast says "processing..." with no progress indicator. After 20s, if still not confirmed: "still processing, try refreshing."

User just paid real money and doesn't know if it worked.

## Fix

1. Show a multi-step progress indicator: "Payment received... Activating Pro... Almost there..."
2. After confirmation, show celebration: "Welcome to Pro! Here's what you just unlocked."
3. If still pending after 20s, provide clear action: "Payment confirmed by Stripe. Your plan will update momentarily. [Refresh Now]"
4. Link to `/api/manage-subscription` (Stripe billing portal) as backup

## Files to Change

- `frontend/app.js:484-521` — improve checkout return UX with progress stages

## Accept When

1. After payment, user sees progressive status updates (not one static toast)
2. Successful confirmation shows celebration and feature unlock summary
3. Timeout shows clear reassurance (payment worked, just takes a moment)
4. Billing portal link available as fallback

## Do NOT Touch

- Polling logic (2s x 10) — that's reasonable
- Stripe webhook handling — server-side is correct
