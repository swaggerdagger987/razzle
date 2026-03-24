---
id: DQ-305
title: Agents page doesn't advertise that free users get 5 AI queries/day
priority: P1
category: conversion
page: agents.html
---

## Problem
The Situation Room has a free tier: 5 AI queries/day without an API key (tracked server-side). This is implemented in `warroom.js` (~line 2501). However, the agents.html page NEVER mentions this:

- Hero section (lines 1614-1627) shows agent badges but no "try free" message
- Setup guide (lines 1834-1835) immediately asks users to configure an API key
- Feature table mentions 5/day for Free but it's buried in a comparison table below fold

A new user landing on /agents.html thinks they need an API key to try anything. They bounce before discovering the free tier exists.

## Expected
Prominent banner or hero subtitle: "Try 5 free AI queries today. No API key needed."

## Fix
Add a visible banner above the scenario textarea or in the hero section that says: "5 free queries/day — no key needed. Get more with Pro." Style it as a warm info box (orange-light bg, chunky border).

## Files
- `frontend/agents.html` — hero section (~line 1614-1627), setup guide (~line 1834)
