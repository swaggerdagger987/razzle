---
id: DQ-318
title: Expired trial state shows bare "Subscribe to Pro" with zero value reminder
priority: P2
category: conversion-copy
page: pricing.html
---

## Problem
When a user's 7-day trial expires, the pricing page (lines 707-722) shows:
- "Your Pro Trial Has Ended"
- Button: "Subscribe to Pro"

No reminder of what they're losing. No urgency. No value recap. The user tried Pro for 7 days — now the page just says "pay up" with zero persuasion.

## Expected
Expired trial state should remind the user what they used during the trial:
- "Your trial ended. Subscribe to keep AI agents, league intelligence, and 70+ panels."
- Or: "You ran X queries during your trial. Keep the intelligence flowing."

## Fix
- `frontend/pricing.html` ~line 710: add a value-reminder line under "Your Pro Trial Has Ended"
- Keep it to 1-2 sentences. Don't be desperate — be direct.

## Files
- `frontend/pricing.html` lines 707-722
