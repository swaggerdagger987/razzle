---
id: DES-332
priority: P2
area: navigation
section: top nav bar
type: consistency
status: open
---

# Prompts page nav includes "Prompts" link absent from all other pages

## What's wrong

The prompts.html top nav shows: Home | Screener | League Intel | AI Agents | **Prompts** | Pricing

Every other page shows: Home | Screener | League Intel | AI Agents | Pricing

The "Prompts" link appears ONLY on the prompts page itself. Users navigating from any other page have no way to discover the Prompts page via the top nav — they can only find it through the footer.

This creates two problems: (1) inconsistent navigation across pages, and (2) the Prompts page is effectively hidden from the primary navigation path.

## Where

`frontend/prompts.html` — the `<nav>` element. Compare to `frontend/index.html`, `frontend/lab.html`, etc.

## Evidence

Snapshot of prompts.html nav: `Home | Screener | League Intel | AI Agents | Prompts | Pricing`
Snapshot of index.html nav: `Home | Screener | League Intel | AI Agents | Pricing`

## Suggested fix

Pick one:

**Option A (add everywhere):** Add "Prompts" to the nav on all 75 pages, between "AI Agents" and "Pricing". This makes the page discoverable but adds a 6th nav item.

**Option B (remove from prompts.html):** Remove the "Prompts" nav link from prompts.html so all pages match. Prompts remains discoverable via the footer.

**Option C (nest under AI Agents):** Make "Prompts" a sub-link under "AI Agents" in a dropdown, since prompts are agent-related content.

## Why this matters

Inconsistent navigation breaks user expectations. A page that only exists in its own nav feels like an orphan.
