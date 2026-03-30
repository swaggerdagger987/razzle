---
id: DQ-420
title: Pricing "Compare up to 4 players" listed as Pro — undersells Free tier comparison (2 players)
priority: P2
category: conversion / copy
page: pricing.html
cycle: 53
---

## Problem

The pricing feature matrix lists "Compare up to 4 players" under Pro/Elite features. Free users CAN compare 2 players (the compare page works for everyone). But the way it's presented makes it look like comparison is Pro-only:

```
Compare players | ✗ | ✓ (up to 4) | ✓ (up to 4)
```

A free user reading this thinks they can't compare players at all. They miss a core free feature.

## Evidence

- pricing.html feature matrix (~line 360): "Compare up to 4 players" listed for Pro/Elite
- Free column shows ✗ for this row
- Reality: Free users CAN compare 2 players (compare.html has no auth gate for 2-player comparison)

## Fix

Update the matrix row to show the free tier capability:

```
Compare players | 2 at a time | Up to 4 | Up to 4
```

Show the Free column as "2 at a time" instead of ✗. This is more honest and showcases the free tier's value.

## Files
- `frontend/pricing.html` — feature matrix comparison row (~line 360)
