# S2-032: Records page text says "2020-present" but data includes all years

**Severity**: S2 (Minor)
**Category**: football-accuracy
**Source**: Deep Audit 2026-03-28, finding S2-017

## Problem

The records page subtitle and meta description say "2020-present" but the backend
API has no year filter — it pulls all available seasons (2015-2025). Either the
text is wrong or the query should be filtered.

## Root Cause

- `frontend/records.html:21` — Meta description: `"and most career points since 2020"`
- `frontend/records.html:117` — Subtitle: `"the all-time fantasy greats (2020-present)"`
- `backend/server.py:3130` — `/api/records` endpoint has no year filter
- `backend/live_data/tools.py:1182` — `fetch_records()` queries all seasons without
  a `WHERE season >= 2020` clause

The data actually includes 2015-2025 records, making the page more valuable than
the text suggests.

## Fix

Update the frontend text to match the actual data:
1. `records.html:21` — Change meta to "since 2015"
2. `records.html:117` — Change subtitle to "(2015-present)"

## Scope

- 1 file: `frontend/records.html`
- 2 line changes
