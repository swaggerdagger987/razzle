---
id: DES-214
title: Safari VoiceOver strips list semantics from list-style:none — zero role="list"
priority: P2
category: accessibility
page: sitewide
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

Safari VoiceOver intentionally removes list semantics from `<ul>` and `<ol>` elements that have `list-style: none`. This means screen reader users on Safari (macOS and iOS) don't hear "list of N items" — they hear flat text. Zero `role="list"` attributes exist anywhere in the codebase to restore this.

## Evidence

12 instances of `list-style: none` across the codebase:

High priority (conversion path):
- pricing.html `.plan-features` (line 110) — Pro/Elite feature lists on the #1 conversion page
- styles.css `.nav-links` (line 202) — main navigation on ALL 75 pages

Medium priority (Lab features):
- lab-panels.css `.ld2-list`, `.rc2-list`, `.rbld-roster-list`, `.tm-roster-list` (4 instances)
- leaders.html, recap.html, rosterbuilder.html, team.html (4 instances)

Other:
- agents.html (1 instance)
- app.js welcome modal (1 instance, inline style)

Zero `role="list"` found in entire codebase.

## Why it matters

Safari is the default browser on iOS (the most common mobile browser for the target 22-40 demographic). VoiceOver users navigating the pricing page can't distinguish the feature list structure — they hear individual text items without the "list of 9 items" context that helps them navigate.

## Fix

Add `role="list"` to all `<ul>` elements with `list-style: none` that contain meaningful list content. The `.nav-links` is the highest leverage — one attribute, 75 pages.

For JS-generated lists (app.js), add the attribute in the innerHTML template.

## Scope

12 instances across 12 files. ~1 attribute per file.
