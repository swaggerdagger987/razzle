---
id: DQ-430
title: Agent API key saved without validation — no persistent error badge after 401 failure
priority: P1
category: UX / conversion
page: agents.html (Situation Room)
cycle: 54
---

## Problem

When users configure their OpenRouter API key in the Situation Room config panel:

1. **No validation on save**: `saveAgentConfig()` (warroom.js ~1472) writes the key to localStorage without any format check (length, prefix, test call). Invalid, empty, or malformed keys are silently saved.

2. **No persistent error state**: When an agent run fails with a 401 (invalid key), the error is shown as a transient toast/briefing card. There's no persistent visual indicator on the Config button or API key input that the saved key is bad.

3. **Stale bad key persists**: Users who paste a bad key, see an error, and navigate away will return next session to the same bad key. They'll try to run agents again, get the same error, and think the service is broken.

## Why it matters

The Situation Room is the premium product. A user who signs up for Pro, opens the Situation Room, pastes their API key wrong, runs agents, sees an error, and can't figure out why — that's a failed conversion moment. The error should clearly point to "your API key is invalid — update it in Config."

## Fix

1. On save: check key length > 20 chars and starts with expected prefix (e.g., `sk-or-`)
2. On 401 error: add a persistent red dot/badge on the Config button and change the API key input border to `var(--red)`
3. On 401 error: show specific message "invalid API key — click Config to update" instead of generic error
4. Optional: add a "Test Key" button in Config that makes a minimal API call

## Files
- `frontend/warroom.js` — saveAgentConfig (~line 1472), agent error handling (~lines 2836-2841)
