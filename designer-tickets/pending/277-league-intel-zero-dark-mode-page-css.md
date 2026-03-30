# DES-277: league-intel.html has zero dark mode page CSS

**Priority**: P1
**Page**: league-intel.html (Bureau of Intelligence — the conversion engine)
**Affects**: Every dark mode user visiting the Bureau

## Problem

league-intel.html (7400 lines) has literally ZERO `[data-theme="dark"]` CSS rules in its `<style>` block. The Bureau is the conversion engine — where free users connect Sleeper and decide to upgrade. The page relies entirely on CSS variable auto-flipping, but massive JS-generated content (manager profile cards, activity feeds, trade network visualizations, Monte Carlo results) uses inline styles that can't be targeted by dark mode rules.

DES-187 covers about.html for the same issue. But league-intel is the CONVERSION ENGINE — dark mode users hitting the Bureau see an inconsistent experience at the exact moment they're deciding whether to pay.

## Evidence

```bash
# Zero dark mode rules in page <style> block
grep -c "data-theme" frontend/league-intel.html
# Result: 0
```

## Fix

Add `[data-theme="dark"]` overrides for:
- Connect card background/borders
- Manager profile cards (JS-generated)
- Activity feed section
- Trade network visualization
- Monte Carlo odds cards
- Any hardcoded light-mode colors in JS-generated innerHTML

Audit all JS-generated inline styles for colors that don't use CSS variables.

## Why This Matters

The Bureau is the bridge from free to paid. Dark mode users (power users — the primary target audience) see an inconsistent page at the exact conversion decision point. Broken dark mode = "unfinished product" signal to the r/DynastyFF audience.
