# DES-159: Home page free tier pricing card omits "70+ analytical panels"

**Priority**: P1 (Conversion messaging — funnel consistency)
**Page**: index.html (Home page)
**Category**: Copy accuracy

## The Problem

The home page free tier pricing card lists these features:
- Full Screener (NFL + College + Prospects)
- 100+ stat columns, 10 seasons of data
- Custom formulas
- Charts, heat maps, PNG export
- Shareable URLs
- Sleeper league connection

But it does NOT mention "70+ analytical panels (preview)" — which is the single biggest free-tier feature and the gateway to Pro conversion. pricing.html correctly lists it. NORTH_STAR.md says free users see panels with lock icons.

## Evidence

- **index.html** free tier card: No mention of panels
- **pricing.html** free tier card: "70+ analytical panels (preview)" listed
- **NORTH_STAR.md**: "Free users see these in the sidebar with lock icons"
- **DES-156** (done): Fixed "60+" to "70+" on the upgrade gate modal — same category of copy accuracy

## The Fix

Add a line to the free tier feature list on index.html:
```
70+ analytical panels (preview)
```

Position it after "100+ stat columns" since panels are the natural next discovery step.

## Why This Matters

A Reddit visitor lands on the home page, scrolls to pricing, sees the free tier has 6 features. They think "cool, a screener." They don't know about the 70+ panels behind it. They leave. If they'd seen "70+ analytical panels (preview)" they'd think "wait, that's massive for free" and click through to explore. The panels ARE the conversion funnel — seeing them locked is what triggers Pro upgrades. Hiding their existence on the home page breaks the top of the funnel.
