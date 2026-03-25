---
id: DES-447
priority: P3
area: navigation
section: footer
type: consistency
status: open
---

# 33 standalone pages missing /prompts.html in footer

## What's wrong

Main pages (index.html, pricing.html, about.html, agents.html) have 39 footer links including a link to /prompts.html. Standalone tool pages (advantage.html, awards.html, breakouts.html, etc.) have 38 footer links — /prompts.html is missing.

This creates inconsistent navigation: a user browsing from the home page can find Prompts in the footer, but a user browsing standalone pages cannot.

Related to DQ-332 (prompts nav inconsistency from the top-nav angle). This is the footer angle.

## Where

All 33 standalone tool pages listed in DQ-155 have 38 footer links.
Main pages (index.html, pricing.html, about.html, agents.html, lab.html, league-intel.html) have 39.

Missing link: `/prompts.html` in the "Razzle" section of the footer.

## Fix

Add `/prompts.html` to the footer of all 33 standalone pages, matching the main page footer template.

Better long-term: extract footer to a shared HTML partial or inject via JS so all pages share one footer source of truth.

## Why it matters

Footer inconsistency breaks user trust in navigation reliability. If /prompts.html is important enough for the home page footer, it should be everywhere.
