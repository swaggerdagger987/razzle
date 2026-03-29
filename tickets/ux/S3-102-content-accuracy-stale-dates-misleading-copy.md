---
id: S3-102
severity: S3
confidence: MEDIUM
category: ux
source: DQ-307+318+353+366+375+417
status: OPEN
---

# Content accuracy — confusing copy, stale dates, missing context

## Problems

1. **Agents page uses "generic mode" jargon** (DQ-307) — Meaningless to new users. Should explain what BYOK mode means in plain language.
2. **Expired trial shows bare "Subscribe to Pro"** (DQ-318) — No value reminder. Should recap what Pro includes and what the user loses by not upgrading.
3. **Expired trial banner reuses active trial styling** (DQ-353) — Same orange styling for "trial active" and "trial ended" creates confusion. Ended state should be visually distinct.
4. **Register 409 doesn't suggest "try signing in"** (DQ-366) — When email already exists, error just says "email already registered" with no link to sign in.
5. **Player comps returns empty with no explanation** (DQ-375) — When a player has < 4 games, comps returns nothing. Should show "Not enough games for comparison" message.
6. **Promo code easter eggs unclear** (DQ-417) — Codes like "TIGER" and "GOAT" activate but don't clarify they're not real discounts.

## Fix

Each is a copy/UX change. No backend logic changes needed.

## Files

- `frontend/agents.html` — "generic mode" terminology
- `frontend/app.js` — trial expiry copy, register 409 error
- `frontend/pricing.html` — promo code feedback
- `frontend/lab-panels.js` or `frontend/player.js` — comps empty state

## Acceptance Criteria

1. No jargon visible to new users
2. Expired trial state visually distinct from active trial
3. "Email already registered" includes "Sign in instead?" link
4. Empty player comps shows explanatory message
