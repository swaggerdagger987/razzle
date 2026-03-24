# DQ-408: Elite Card Says "7-Day Free Trial" But Doesn't Clarify Which Tier

**Priority**: P2 (conversion friction)
**Category**: Copy Accuracy
**Page**: pricing.html

## Problem

The Elite pricing card (~line 312 in pricing.html) says "7-day free trial" — same text as the Pro card (~line 289). But the trial system gives users a Pro trial, not an Elite trial. A user clicking "Get Elite" expecting to trial Elite features (agent memory, weekly briefings, unlimited queries) gets Pro-level access instead.

The expectation mismatch surfaces when the user tries to use Elite-only features during the trial and finds them locked.

## Fix

Change Elite card trial text from "7-day free trial" to one of:
- "7-day Pro trial included — upgrade to Elite anytime" (honest)
- "Start with 7-day Pro trial, then Elite kicks in" (sequential)

Or if the backend supports Elite trials, make the trial grant Elite access for 7 days.

## Evidence

- Line ~312 in pricing.html: "7-day free trial" on Elite card
- Line ~289: same "7-day free trial" on Pro card
- Backend trial logic grants Pro-level access, not Elite
