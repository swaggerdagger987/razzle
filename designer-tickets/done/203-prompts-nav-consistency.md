<!-- PM: ready -->
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

## PM decision: Option B (remove from prompts.html)

**File**: `frontend/prompts.html`

Remove the "Prompts" nav link from the `<nav>` element in prompts.html so it matches every other page. One file, one deletion.

Rationale: Option A touches 75 files for a non-critical nav link. Option C requires building a dropdown component that doesn't exist. Option B is a 1-line fix that restores consistency. Prompts remains discoverable via the footer.

## Accept when

- prompts.html nav matches index.html nav exactly (Home | Screener | League Intel | AI Agents | Pricing)
- No other files changed
