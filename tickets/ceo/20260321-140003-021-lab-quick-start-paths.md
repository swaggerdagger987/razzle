# Ticket 021 — Lab Quick-Start Paths by User Type

**ID**: 20260321-140003-021
**Page**: Lab
**Type**: structural
**Severity**: P0
**Created**: 2026-03-21

## Problem

The Lab has 68 panels organized into 9 sidebar categories. First-time users see the same undifferentiated list regardless of whether they play dynasty, redraft, or are researching prospects.

Search requires knowing what to search for. Favorites are empty. Recently viewed is empty. The user's first experience is a wall of panel names with no guidance on where to start.

Review #1 ticket 006 identified the need for "Start Here" guidance. This ticket upgrades that to user-type-specific paths — different entry points for different users.

## BEFORE

All users see the same 68-panel sidebar. No indication of which panels matter for their use case. Discovery is accidental.

## AFTER

First Lab visit (no localStorage state) shows a quick-start overlay or inline prompt with 3 paths:

1. **Dynasty Research** — opens Dynasty Rankings, highlights Trade Values, Breakouts, Aging Curves, Buy/Sell in sidebar. Sets "dynasty" as user type in localStorage.
2. **Redraft Season** — opens Weekly Heatmap, highlights Matchups, Waivers, Cheat Sheet, Consistency. Sets "redraft."
3. **Prospect Scouting** — opens Big Board, highlights Draft Class, Percentiles, Mock Draft. Sets "prospects."

Each path:
- Opens the most popular panel in that category
- Highlights 4-6 related panels in the sidebar with a subtle pulse or accent
- Collapses irrelevant sidebar categories
- Stores user type for future personalization
- Can be changed anytime via a "Switch path" option in sidebar header

Power users dismiss in one click ("Show me everything").

## Why This Matters

68 tools is a flex, not a feature. Users don't want 68 options — they want the 5 that matter to them. The quick-start path reduces cognitive load from "browse 68 items" to "click one button."

## Accept When

First-time Lab visitor sees quick-start prompt. Choosing "Dynasty Research" opens Dynasty Rankings and highlights related panels. Choosing "Show me everything" restores the full sidebar. User type persists across sessions.
