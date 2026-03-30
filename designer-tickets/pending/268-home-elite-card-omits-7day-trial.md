---
id: DES-268
title: Home page Elite card omits "7-day free trial" line item
priority: P1
page: index.html
category: conversion-copy
cycle: 26
---

## Problem

The home page pricing section has three cards: Free, Pro, Elite. The Pro card (index.html:820) includes "7-day free trial" as a highlighted list item. The Elite card (lines 831-838) does NOT mention the trial at all. Both plans offer the identical 7-day trial.

On pricing.html, BOTH Pro (line 289) and Elite (line 312) correctly list "7-day free trial." The home page creates an inconsistency: users scanning the cards may conclude the trial is Pro-only.

## Evidence

- index.html:820 — Pro card: `<li class="highlight">7-day free trial</li>` present
- index.html:831-838 — Elite card: 6 list items, zero mention of trial
- pricing.html:289 — Pro card: `<li>...7-day free trial</li>` present
- pricing.html:312 — Elite card: `<li>...7-day free trial</li>` present

## Fix

Add `<li class="highlight">7-day free trial</li>` to the Elite card's `<ul class="pricing-list">` on index.html, after "Weekly Razzle briefings."

## Why This Matters

The home page is the #1 landing page. Users deciding between Pro and Elite see the trial mentioned only on Pro. This creates a false signal that may push Elite-curious users toward Pro (lower revenue) or cause hesitation.
