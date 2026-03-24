---
id: DQ-416
title: "Get Pro" button silently opens auth modal — no explanation toast for unauthenticated users
priority: P2
category: conversion / UX
page: pricing.html
cycle: 53
---

## Problem

When an unauthenticated user clicks "Get Pro" or "Get Elite" on the pricing page, the `handleCheckout()` function checks for a token, doesn't find one, and calls `openAuthModal()`. The auth modal appears with no context about WHY it appeared.

User expects to see a checkout page. Instead they see a login/register form with no message like "Create a free account to start your trial."

## Evidence

From app.js handleCheckout flow:
1. User clicks "Get Pro"
2. No token → `openAuthModal()` called
3. Auth modal opens — no toast, no banner, no explanation
4. User confused: "I wanted to buy, why am I registering?"

## Fix

Before opening auth modal, show a toast or inject a message into the modal:
```javascript
_showToast("Create a free account to start your 7-day trial", "info");
openAuthModal();
```

Or add a contextual banner inside the auth modal when triggered from checkout: "Sign up to start your free trial — no credit card needed."

## Files
- `frontend/app.js` — handleCheckout function
- `frontend/pricing.html` — CTA buttons
