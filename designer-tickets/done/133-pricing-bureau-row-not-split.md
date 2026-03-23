# DES-133: Pricing feature matrix doesn't distinguish Bureau free vs Pro access

**Priority:** P2 — Conversion Messaging
**Component:** pricing.html
**Affects:** Bureau conversion funnel

## Problem

The feature matrix row at line 358 says:
```
Bureau of Intelligence (rosters, standings) | ✓ | ✓ | ✓
```

This implies all three tiers get the same Bureau access. But NORTH_STAR.md (lines 48-68) defines a clear split:

**Free**: League odds summary cards (Monte Carlo championship/playoff probabilities), basic roster overview and standings
**Pro**: Full deep-dive — Self-Scout, Roster Depth Analysis, Build Profiles, Trade Network, Waiver Tendencies, Manager Profiles, Pressure Map, Power Rankings, Head-to-Head, SoS, Monte Carlo Deep-Dive, Trade Finder

The Bureau deep-dive is the primary conversion engine. If the pricing page doesn't make the free→Pro Bureau distinction clear, users don't know what they're paying for.

## Evidence

- `pricing.html:358` — Single row: `Bureau of Intelligence (rosters, standings) ✓ ✓ ✓`
- `docs/NORTH_STAR.md:48-64` — Detailed free vs Pro Bureau feature split
- No other row in the matrix covers Bureau deep-dive features

## Fix

Replace the single Bureau row with two rows:
```html
<tr><td>Bureau summary (league odds, rosters)</td><td class="yes">✓</td><td class="yes">✓</td><td class="yes">✓</td></tr>
<tr><td>Bureau deep-dive (Self-Scout, Trade Network, Pressure Map, Manager Profiles, Power Rankings...)</td><td class="no">—</td><td class="yes">✓</td><td class="yes">✓</td></tr>
```

## Why it matters

The Bureau is the conversion engine (NORTH_STAR: "If a manager sees their league data analyzed and doesn't feel the urge to upgrade, the Bureau isn't good enough yet"). The pricing page must clearly show what Pro unlocks in the Bureau — otherwise users think free gives them everything.
