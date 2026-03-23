# DES-168: Player headshot images use empty alt="" on 29+ pages

**Priority**: P2
**Category**: Accessibility
**Affects**: 25+ standalone panel pages, lab-panels.js, app.js — every player headshot sitewide
**Cycle**: 16

## Problem

Player headshot images are rendered with `alt=""` across 29+ pages. This marks them as decorative (ARIA-hidden from screen readers). But player headshots are meaningful content — they identify which player is being discussed. Screen reader users hear nothing for these images.

## Evidence

29 instances across 25+ files. Pattern:
```javascript
html += '<img class="air-headshot" src="' + escapeHtml(p.headshot_url) + '" alt="" loading="lazy" ...>';
```

Affected pages include: airyards, breakouts, awards, consistency, buysell, efficiency, opportunity, leaders, matchups, redzone, reportcard, rosterbuilder, schedule, scoring, stocks, team, tradefinder, tradevalues, usage, vorp, yoy, and more.

Agent icons in lab.html and agents.html also use `alt=""` (6 instances) — but DES-112 already covers those.

## Fix

Use the player's name in the alt attribute:
```javascript
html += '<img class="air-headshot" src="' + escapeHtml(p.headshot_url) + '" alt="' + escapeHtml(p.full_name || p.name) + '" loading="lazy" ...>';
```

For panel pages where the player name is already in adjacent text, `alt="Headshot"` is acceptable — but player name is preferred.

## Why it matters

Dynasty power users include screen reader users. The Lab is the growth engine — every panel should be accessible. Empty alt on identity images also hurts SEO image indexing.
