# Ticket 022 — Consolidate Standalone Pages into Lab Panel Canonical URLs

**ID**: 20260321-140004-022
**Page**: Global architecture
**Type**: structural
**Severity**: P0
**Created**: 2026-03-21

## Problem

74 HTML files in /frontend/. 68 panels in the Lab sidebar. Many overlap — aging.html exists as both a standalone page AND a Lab panel. breakouts.html too. weekly.html too.

A user can reach aging curves at:
- `/aging.html` (standalone page with its own nav, footer, full HTML document)
- `/lab.html?panel=aging-curves` (Lab sidebar panel)

This causes:
1. **SEO fragmentation** — Google sees two URLs with the same content, splits ranking authority
2. **Navigation confusion** — "Where did I see that chart?" Two different frames for the same data
3. **Maintenance debt** — Changes must be made in two places (standalone file + lab-panels.js)
4. **Brand dilution** — Standalone pages feel like a different site than the Lab

## BEFORE

74 standalone HTML files + 68 Lab panels = two paths to the same content. User doesn't know which frame they're in.

## AFTER

The Lab is the canonical hub. Standalone pages fall into three categories:

**Category 1: Redirect to Lab panel** (most pages)
- aging.html → 301 redirect to /lab.html?panel=aging-curves
- breakouts.html → /lab.html?panel=breakout-finder
- weekly.html → /lab.html?panel=weekly-heatmap
- (40+ pages follow this pattern)

**Category 2: Keep as standalone** (pages that don't fit the Lab frame)
- index.html (landing page)
- league-intel.html (Bureau — separate product area)
- agents.html (Situation Room — separate product area)
- pricing.html (conversion page)
- about.html (info page)
- 404.html (error page)
- player.html (SEO entry point — redirect to Lab profile panel)
- compare.html (SEO entry point — redirect to Lab compare panel)
- team.html (SEO entry point — redirect to Lab team panel)

**Category 3: Lightweight landing pages** (for SEO/social sharing)
- Keep the standalone URL as a lightweight page with meta tags + auto-redirect into the Lab panel after 0ms (meta refresh or JS redirect)
- Preserves OpenGraph metadata for link previews
- Preserves canonical URLs for SEO juice
- User lands in the Lab context immediately

## Why This Matters

The Lab sidebar is the product's core navigation. Every standalone page that lives outside the Lab is a user who misses the sidebar, misses panel discovery, and has no path to explore adjacent tools. The Lab sidebar IS the conversion mechanism — it shows users how deep the product goes.

## Accept When

All analytical tool pages redirect into Lab panel views. SEO meta tags preserved on entry URLs. No duplicate content across two URLs. Lab is the single canonical frame for all tools.
