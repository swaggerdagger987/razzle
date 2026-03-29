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

Investigation found the backend `fetch_records()` at `backend/live_data/tools.py:1182` has NO year filter — it queries ALL seasons. The SQL queries (lines 1195-1251) have no WHERE clause limiting seasons.

The issue is actually in the **meta description** — `frontend/records.html:21` claims data "since 2020" but the data actually spans 2015-2025. The backend is correct; the marketing copy is wrong.

## Fix

1. Update `frontend/records.html:21` meta description to say "since 2015" or remove the year claim
2. Verify that records from 2015-2019 actually display on the page (the backend serves them, but the frontend may filter)
3. If the frontend season selector limits to 2020+, expand it

## Accept When

- Meta description accurately reflects the data range
- Records from 2015-2019 are accessible to users
- Historical records (2019 CMC, 2018 Mahomes) appear when selected
