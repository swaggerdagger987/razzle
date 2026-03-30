# DQ-103: Pro gate panels show identical generic lock screens

**Priority**: P1
**Category**: Conversion / UX
**Page**: lab.html (upgrade gate ~line 4395)
**Evidence**: awards-light-desktop.png, stocks-light-desktop.png, tradefinder-light-desktop.png

## Problem

When a non-Pro user accesses any Pro panel from the Lab sidebar, they see the exact same generic message:

> "[Panel Name] is a Pro panel"
> "unlock 70+ advanced panels, full historical data, CSV export, and custom formulas with Pro"
> [See Plans button]

This is identical across all ~48 Pro panels. No preview of what the panel shows. No sample data. No panel-specific description. No personality.

A visitor who clicks "Awards" or "Trade Finder" in the sidebar learns nothing about what that panel actually does. They have zero motivation to upgrade because they can't see what they're missing.

The Bureau (league-intel.html) already does this RIGHT — each Pro tab has unique teaser text ("see what your opponents don't want you to know"). The Lab's gate needs the same treatment.

## Fix

In lab.html's upgrade gate function (~line 4395), add a panel-specific description object:

```js
const PANEL_TEASERS = {
  awards: "10 data-driven fantasy superlatives. Who's the real MVP?",
  stocks: "Rising and falling dynasty assets based on efficiency, consistency, and schedule.",
  tradefinder: "Find fair trade targets matched to your roster needs.",
  dashboard: "At-a-glance dynasty overview: top risers, fallers, value picks, scarcity.",
  // ... at least 10 panels
};
```

Display the teaser below the panel name. Bonus: add a blurred/dimmed static preview image per panel.

Start with the top 10 most-clicked panels. The rest can keep the generic message.

## Verification

Click 5 different Pro panels in the Lab sidebar. Each should show a unique, panel-specific description that tells the user what they'd see if they upgraded.
