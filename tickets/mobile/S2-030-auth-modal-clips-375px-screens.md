---
id: S2-030
severity: S2
category: mobile
title: Auth modal width 340px clips on 375px screens (iPhone SE)
source: deep-audit
status: open
---

## Problem

The auth modal has `width: 340px` at the 768px breakpoint. On a 375px screen (iPhone SE), this leaves only 17.5px margin each side. Tight but technically fits at 390px, but clips on iPhone SE (375px) with system padding.

## Root Cause

`frontend/styles.css` — auth modal mobile breakpoint sets fixed `width: 340px` instead of a responsive value.

## Fix

Change width to `width: min(340px, calc(100vw - 32px))` to ensure 16px margin on each side regardless of screen width.

## Accept When

- Auth modal fits comfortably on 375px screens with visible margin on both sides
- 390px+ screens are not affected
