---
id: S2-038
severity: S2
category: backend
title: Records page only shows 2020-present data despite DB containing 2015-2025
source: deep-audit
status: open
---

## Problem

The records page appears to only show data from 2020-present, despite the database containing data from 2015-2025. This means records from 2015-2019 are excluded, missing prime Patrick Mahomes, peak CMC seasons, etc.

## Root Cause

The records endpoint in `backend/live_data/` likely has a hardcoded season range starting at 2020, or the records page's season selector only offers 2020+. Needs investigation.

## Fix

1. Identify the season filter in the records backend endpoint
2. Expand to include all available seasons (2015-2025)
3. Update the records page season selector to offer the full range
4. Verify that historical records display correctly

## Accept When

- Records page shows data from 2015-2025
- Historical records (e.g., 2019 CMC, 2018 Mahomes) appear in the record book
- Season selector offers 2015 as the earliest option
