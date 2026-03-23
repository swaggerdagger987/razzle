# DES-241: Feature matrix "70+ panels (preview)" copy misleads free users

**Priority:** P1 — conversion friction
**Page:** pricing.html lines 250, 357
**Cycle:** 23

## Problem

Two instances on pricing.html claim free users get "70+ analytical panels (preview)":

Line 250 (free card chip):
```html
<span class="free-chip">70+ analytical panels (preview)</span>
```

Line 357 (feature matrix row):
```html
<tr><td>70+ analytical panels (preview)</td><td class="yes">&#10003;</td><td class="yes">&#10003;</td><td class="yes">&#10003;</td></tr>
```

NORTH_STAR.md (lines 38-42) states: "Free users see these in the sidebar with lock icons. Pro/Elite users get full access."

The word "preview" implies free users can see panel content — they cannot. They see panel NAMES and lock icons in the Lab sidebar. A free user clicking a locked panel sees an upgrade gate, not a preview. "Preview" creates an expectation that isn't met, which feels like a bait-and-switch.

## Fix

Change copy to accurately describe what free users see:

```html
<!-- Option A: honest about lock -->
<span class="free-chip">70+ analytical panels (names visible, Pro unlocks)</span>

<!-- Option B: reframe positively -->
<span class="free-chip">70+ analytical panels (explore the catalog)</span>

<!-- Option C: simplest -->
<span class="free-chip">70+ analytical panels</span>
```

Option C is cleanest — the checkmark in the matrix already implies some access, and the Pro/Elite columns clarify the gate.

## Why this matters

The pricing page is where conversion decisions happen. "Preview" that isn't actually a preview erodes trust at the exact moment trust matters most. This is especially damaging with the r/DynastyFF audience, who are allergic to products that oversell free tiers.
