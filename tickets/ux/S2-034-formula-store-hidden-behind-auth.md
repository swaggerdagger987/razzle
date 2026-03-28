---
id: S2-034
severity: S2
category: ux
title: Formula store requires account to browse — should be visible to all users
source: deep-audit
status: open
---

## Problem

The formula store (community marketplace) requires authentication to browse, rate, and share formulas. Free users can create local formulas but cannot see the community store. The formula store is a differentiator — hiding it behind auth reduces discoverability.

## Root Cause

`frontend/formula-store.js` or `frontend/formulas.js` — auth check gates access to the formula store API endpoints.

## Fix

1. Show the formula store to all users with formulas browsable without auth
2. Gate interactive actions (rate, share, save-to-cloud) behind "Sign in to save and share" prompt
3. Let the store serve as social proof and a conversion driver

## Accept When

- Unauthenticated users can browse the formula store and see community formulas
- Interactive actions (rate, share) prompt for sign-in
- Local formula creation still works without auth
