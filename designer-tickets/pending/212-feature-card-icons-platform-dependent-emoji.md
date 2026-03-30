---
id: DES-212
title: Home page feature card icons use platform-dependent emoji
priority: P3
category: brand-identity
page: index.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

The 4 feature showcase cards on the home page use emoji characters as icons: 📊 🧮 📸 🔗. These render differently on Apple, Google, Samsung, Windows, and Firefox/Android. The visual identity of the first feature section is platform-dependent.

## Evidence

index.html lines 693-711:
```html
<div class="feature-card-icon">📊</div>  <!-- 100+ Stat Columns -->
<div class="feature-card-icon">🧮</div>  <!-- Custom Formulas -->
<div class="feature-card-icon">📸</div>  <!-- PNG Export -->
<div class="feature-card-icon">🔗</div>  <!-- Shareable URLs -->
```

DES-174 (pending) covers the same issue for the hero mascot emoji (🐯). This ticket covers the 4 feature card icons specifically.

## Why it matters

Reddit screenshots posted from different devices will show different feature icons. The brand should look identical across platforms. Agent SVGs exist and look great — feature icons should match that level of design control.

## Fix

Replace emoji with inline SVG icons that match the Razzle aesthetic (chunky, warm, sand-colored). Options:
1. Design 4 simple SVG icons matching the agent icon style
2. Use a consistent icon set (e.g., Lucide icons styled with `--ink` color and `--orange` accent)
3. Use text-based icons (less ideal but platform-consistent)

## Scope

index.html — 4 emoji replacements. Requires SVG assets to be created or sourced.
