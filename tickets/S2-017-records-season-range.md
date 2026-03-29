---
id: S2-017
severity: S2
category: football-accuracy
title: "Records page includes 2015-present (not limited to 2020)"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S2-017: Records page limited to 2020-present

## Finding

The deep audit says the records page only shows data from 2020-present, missing 2015-2019.

## Root Cause Investigation

**Status: Audit finding is incorrect.**

**File: `frontend/records.html:116`** — Subtitle reads: "the all-time fantasy greats (2015-present)"
**File: `frontend/records.html:20`** — Meta description: "most career points since 2015"
**File: `frontend/lab-panels.js:5532`** — Season iteration goes back to 2015.

The records page includes all seasons from 2015 to present.

## Conclusion

No action needed. Records include 2015-present.
