---
id: DES-342
priority: P2
area: prompts.html
section: category headers
type: visual / design consistency
status: open
---

# Prompts page category headers are flat orange strips with no chunky card treatment

## What's wrong

The Prompt Library page organizes prompts into categories (Agent Roster Analysis, Evaluate Matchup Identities, etc.). Each category header is a flat orange background strip — no 3px border, no 4px offset shadow, no chunky card energy.

This makes the prompts page feel like documentation rather than a Razzle page. Every other page in the product (Lab panels, dashboard sections, pricing cards) uses chunky bordered cards. The prompts page is the outlier.

## Where

`frontend/prompts.html` — category section headers throughout the page.

## Evidence

Screenshot: prompts-desktop.png — the category headers are flat orange bars spanning the full width with white text. Compare to breakouts.html where section headers use chunky bordered cards with position-colored top stripes.

## Suggested fix

1. Give category headers the chunky card treatment: 3px solid var(--ink) border, 4px 4px 0 offset shadow
2. Use var(--orange) as a 6px top stripe (like other cards) instead of full orange background fill
3. The header text should be in Display font (Garfield/Luckiest Guy) at 16px per type scale
4. Add hover lift on the section headers for interactivity

## Why this matters

The prompts page is a selling point for the AI agents feature. If it looks like a plain documentation page, it undermines the "playful comic-strip energy" that the rest of the site delivers. Consistency is brand.
