# FUNC-035: QB Efficiency Metrics Still Wrong on Production

**Severity**: P0
**Flow**: 36 (Efficiency metrics)
**Status**: OPEN
**Session**: 35
**Date**: 2026-03-21

## Description

QB efficiency rankings on production show opportunities = carries only (no pass attempts).
This makes QB PPO, TD rate, and ranking completely wrong.

## Evidence

**Prod API** (`/api/efficiency-rankings?season=2025&position=QB`):
- Dak Prescott: opportunities=53, PPO=5.92, TD rate=60.4%
- Baker Mayfield: opportunities=55, PPO=4.94, TD rate=49.1%
- Josh Allen: opportunities=112, PPO=3.26

**Cross-check via screener** (`/api/players?search=prescott`):
- Dak Prescott: attempts=600, carries=53
- Correct opportunities = 600 + 53 = 653

**Result**: QB PPO inflated ~10x, TD rate inflated ~10x, rankings meaningless.

## Root Cause

Fix exists in codebase (dashboards.py:78 adds `SUM(s.attempts) as pass_attempts`,
line 121-122 uses `pass_attempts + carries` for QBs). But the fix has NOT been deployed
to Render production.

This is a deployment gap, not a code bug. The code is correct.

## Fix

Deploy latest code to Render. This is FUNC-030 from session 34 still unresolved.

## Impact

A dynasty league vet looking at QB efficiency would see Dak Prescott with a 60.4% TD rate
and 5.92 points per opportunity. This is obviously wrong and destroys credibility.
