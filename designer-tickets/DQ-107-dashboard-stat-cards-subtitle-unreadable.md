# DQ-107: Dashboard stat summary cards — subtitle text barely readable

**Priority**: P2
**Category**: Typography / readability
**Severity**: Medium — key contextual information is too small to read
**Evidence**: Visual — desktop screenshot of dashboard.html at 1440x900

## What's wrong

The dashboard's 4 wide stat summary cards (showing values like "13.5 PPG", "8.6", "8.4", "6.2") have subtitle/context text below the large numbers that appears to be 9-10px font-size — below the DESIGN.md minimum of 11px.

These subtitles provide critical context: "vs starters", "PPG above flex", etc. Without reading them, the big numbers are meaningless. But the text is so small it's nearly invisible on desktop and completely unreadable on mobile.

## Where

- `frontend/dashboard.html` — stat summary card subtitle elements
- Likely uses inline `font-size: 10px` or `font-size: 9px` (common pattern per DQ-071/072)

## Expected (per DESIGN.md)

Type scale minimum is 11px (Display uppercase) or 12px (Mono badges). Stat context labels should be at least 12px Space Mono.

## Fix

1. Find the subtitle elements in dashboard.html stat cards
2. Change font-size from 9-10px to 12px
3. Use `font-family: var(--font-mono)` and `color: var(--ink-medium)` for proper hierarchy

## Verification

Open dashboard.html. The text below the big stat numbers should be clearly readable without squinting.
