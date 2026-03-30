---
id: DQ-486
title: "Priority data refresh" claimed on home + pricing pages — undefined feature
severity: P2
category: content-accuracy
files: frontend/index.html, frontend/pricing.html
lines: index.html:837
---

## Problem

Home page and pricing page list "Priority data refresh" as an Elite feature. This is never defined anywhere — the backend has no tiered data refresh mechanism. All users get the same data from the same nflverse adapter on the same schedule.

Users upgrading for "priority data" will see no difference from free-tier data freshness.

## Expected

Either:
1. **Define and implement** tiered data refresh (e.g., Elite gets data refreshed every hour, free gets daily), OR
2. **Replace** with a concrete, deliverable feature description (e.g., "Real-time stat alerts" or remove entirely)

## Acceptance Criteria

- "Priority data refresh" either has a working backend implementation or is replaced with a real feature
