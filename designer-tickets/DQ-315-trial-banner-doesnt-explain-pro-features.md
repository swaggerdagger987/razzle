---
id: DQ-315
title: Trial banner says "7 days of Pro" without explaining what Pro includes
priority: P2
category: conversion-copy
page: pricing.html
---

## Problem
The trial banner (pricing.html lines 216-219) says:
> "7 days of Pro. On the house."
> "No credit card. Just sign up and hit the ground running."

A new visitor doesn't know what "Pro" means yet. They haven't scrolled to the feature matrix. The banner is the first thing they see but it's empty of value props.

## Expected
Add a one-liner listing the key Pro features: "7 days of Pro: AI agents, league intelligence, 70+ analytical panels. On the house."

## Fix
- `frontend/pricing.html` line 216: expand text to include key Pro features
- Keep it to one line — don't bloat the banner

## Files
- `frontend/pricing.html` lines 216-219
