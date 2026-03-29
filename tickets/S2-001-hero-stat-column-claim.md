---
id: S2-001
severity: S2
category: football-accuracy
title: "Hero section stat column claim"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S2-001: Hero section "150+ stat columns" claim may be inflated

## Finding

The deep audit says the hero claims "150+ stat columns" which may be inflated.

## Root Cause Investigation

**Status: Audit finding is outdated.**

**File: `frontend/index.html:660`** — Hero text reads:
```
100+ stat columns across NFL, college & prospects. Custom formulas. Shareable views. No account required.
```

The claim is "100+ stat columns" (not "150+"). This matches the feature card at line 711 and social card at line 752.

## Conclusion

The hero correctly claims "100+", not "150+". No action needed.
