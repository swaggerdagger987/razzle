# DES-230: Post-checkout welcome modal says "60+ panels" — marketing says 70+

**Priority:** P1 — trust/copy mismatch
**Page:** All (welcome modal via app.js)
**Cycle:** 22

## Problem

app.js:774 and app.js:781 both say `"All 60+ analytical panels"` in the feature list shown to users immediately after they pay.

Every other marketing surface says 70+:
- NORTH_STAR.md: "70+ analytical panels"
- DESIGN.md: "70+ analytics tools"
- pricing.html: "70+ analytical panels (preview)" (line 250, 357)
- Home page: no specific number but consistent with 70+
- Lab upgrade gate: "unlock 70+ advanced panels" (line 4396, fixed by DES-156)

DES-156 fixed the same issue in `_showUpgradeGate()` but missed the `_showWelcomeModal()` function.

## Fix

Change both instances in app.js `_showWelcomeModal()`:
```
"All 60+ analytical panels"  ->  "All 70+ analytical panels"
```

Lines 774 and 781.

## Why this matters

This modal appears at the highest-stakes moment: immediately after a user pays. If they notice the discrepancy with the pricing page they just read, it creates a "did I get scammed?" reflex. For $80-150/year, users scrutinize what they're getting.
