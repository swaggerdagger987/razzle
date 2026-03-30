---
id: DQ-452
priority: P1
category: incomplete-fix-verification
status: open
cycle: 58
---

# DQ-452: Done ticket DES-058 incomplete — 305 sub-minimum border-radius instances remain in 63 files

## Problem

Ticket DES-058 was marked DONE. It claimed to replace ~300 instances of `border-radius: 3-7px` with `var(--radius-sm)` (8px minimum) across 66 HTML files.

**Verification shows 305 instances still present across 63 files.** The fix was either never applied or was reverted by subsequent build phases.

## Evidence

```bash
grep -rn "border-radius:\s*[3-7]px" frontend/*.html | wc -l
# Result: 305 matches across 63 files
```

These are in inline `<style>` blocks and `style=` attributes using hardcoded 3px, 4px, 5px, 6px, or 7px border-radius — all below the 8px minimum token.

## Fix

Batch replace across all 63 HTML files:
- `border-radius: 3px` → `border-radius: var(--radius-sm)` (or `8px`)
- `border-radius: 4px` → `border-radius: var(--radius-sm)`
- `border-radius: 5px` → `border-radius: var(--radius-sm)`
- `border-radius: 6px` → `border-radius: var(--radius-sm)`
- `border-radius: 7px` → `border-radius: var(--radius-sm)`

Exception: progress bar fills (`.bar-fill`) may use 4px if the track is 6px — use judgment on inner-bar elements.

## Why It Matters

This is the single largest design token violation by count. 305 instances across 63 files means nearly every standalone page has off-spec corners. The design guide only allows 8px, 12px, or 20px.

## Verification

```bash
grep -rn "border-radius:\s*[3-7]px" frontend/*.html | wc -l
# Should be 0 (or near-zero with documented exceptions)
```
