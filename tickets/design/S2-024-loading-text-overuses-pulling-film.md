---
id: S2-024
severity: S2
category: design
title: Loading text overuses "pulling film..." — 40+ pages share the same phrase
source: deep-audit
status: open
---

## Problem

DESIGN.md says loading states should have personality, but most pages use the same "pulling film..." text. Having 40+ pages all say the same thing defeats the personality purpose. Some pages use contextual messages ("running the numbers...", "checking the tape...") but they are the minority.

## Root Cause

The loading text is set per-page in each HTML file's initial state, and in JS fetch callbacks. Most were copied from a template without customizing the loading message.

## Fix

Create a page-specific loading message for each category of page:
- Dynasty tools: "scouting the dynasty board..."
- Weekly analytics: "breaking down the tape..."
- Trade tools: "evaluating the deal..."
- Matchup tools: "studying the defense..."
- Draft tools: "clocking 40 times..."
- Records/Awards: "checking the record books..."
- Player profiles: "pulling the scouting report..."

## Accept When

- At least 10 different contextual loading messages exist across the site
- No single loading message is used on more than 10 pages
