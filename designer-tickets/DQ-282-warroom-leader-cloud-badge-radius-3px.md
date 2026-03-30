---
id: DQ-282
priority: P3
category: border-radius
status: open
---

# DQ-282: warroom.js LEADER and cloud-synced badges use border-radius:3px

## Problem

DESIGN.md border radius tokens: 8px (small), 12px (default), 20px (pills). No 3px token exists.

Two inline-styled badges in warroom.js use `border-radius:3px`:

## Where

| Line | Element | Current | Should be |
|------|---------|---------|-----------|
| 3113 | LEADER badge `<span>` | `border-radius:3px` | `border-radius:8px` |
| 3615 | cloud-synced badge `<div>` | `border-radius:3px` | `border-radius:8px` |

## Fix

2 replacements in `frontend/warroom.js`:
- Line 3113: `border-radius:3px` -> `border-radius:var(--radius-sm)`
- Line 3615: `border-radius:3px` -> `border-radius:var(--radius-sm)`

## Not a dupe of

DQ-196 covers `border-radius:3px` in lab-panels.js only. These are in warroom.js -- different file, different badges.
