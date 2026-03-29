---
id: S3-060
severity: S3
confidence: MEDIUM
category: ux-flow
source: DQ-086
status: OPEN
---

# Standalone pages use text-only loading — no skeleton cards

## Root Cause

20+ standalone pages show a bare text loading message ("pulling film...") instead of skeleton placeholder cards. The Lab has proper loading skeletons; standalone pages don't. This causes layout shift when data loads and feels less polished.

## Affected Pages

dashboard.html, rankings.html, tiers.html, aging.html, airyards.html, awards.html, breakouts.html, buysell.html, consistency.html, efficiency.html, leaders.html, matchups.html, opportunity.html, redzone.html, reportcard.html, scarcity.html, stocks.html, targets.html, usage.html, yoy.html, + 8 newer pages

## Fix

Add skeleton card placeholders that match the final layout:
```html
<div class="loading-skeleton">
  <div class="skeleton-card" style="height:200px"></div>
  <div class="skeleton-card" style="height:200px"></div>
</div>
```

With CSS shimmer animation in styles.css.

## Acceptance Criteria

- Skeleton cards visible during loading on all standalone pages
- Skeletons match the rough layout of the final content
- No layout shift when data loads
