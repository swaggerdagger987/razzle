---
id: DQ-100
title: Pricing dark mode — FAQ and feature description sections have insufficient contrast
priority: P2
category: dark-mode
status: open
cycle: 13
---

## Problem

In dark mode, the entire lower portion of the pricing page (below the pricing cards) is barely readable. The "Questions on Each Feature" section, individual feature descriptions, and FAQ answers all display as low-contrast brown-on-brown text.

DQ-041 covers the comparison TABLE specifically. This ticket covers the FAQ/feature description SECTIONS below it — different content, different HTML structure, same root cause: text colors not overridden for dark mode.

## Evidence

Visual: Screenshot of pricing.html in dark mode (data-theme="dark") at 1440x900, scrolled to FAQ section. Text blends into background — questions and answers both display at approximately 2:1 contrast ratio (WCAG requires 4.5:1 minimum for normal text).

The pricing page uses inline or page-scoped styles for the FAQ sections that don't inherit dark mode variable overrides. The comparison table (DQ-041) and these FAQ sections share the same root cause but different DOM elements.

## Fix

Ensure all text in the pricing FAQ sections uses `color: var(--ink)` or `color: var(--ink-medium)` (which auto-flip in dark mode) instead of hardcoded or inherited light-mode colors. Check:

1. Feature description paragraphs
2. Question headings
3. Answer body text
4. Section dividers

All should use CSS variable colors that respond to `[data-theme="dark"]`.

## Files
- `frontend/pricing.html` (FAQ and feature description sections, likely lines 200+)
