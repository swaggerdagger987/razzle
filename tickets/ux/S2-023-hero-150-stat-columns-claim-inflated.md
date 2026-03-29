---
id: S2-023
severity: S2
category: ux
title: Hero section "150+ stat columns" claim may be inflated — clarify or verify
source: deep-audit
status: open
---

## Problem

The landing page hero claims "150+ stat columns." The Lab screener has ~100 columns for NFL mode. Adding college and prospect columns may reach 150, but the claim counts across all modes combined rather than columns available simultaneously.

Dynasty power users who count columns and find 85 may feel misled.

## Root Cause

**`frontend/index.html:660`** — hero sub-text:
```html
<div class="hero-sub">100+ stat columns across NFL, college &amp; prospects. Custom formulas. Shareable views. No account required.</div>
```

**Note**: The current claim is **"100+"**, not "150+" as the deep audit reported. The "100+" claim appears in three places:
- `frontend/index.html:660` — hero sub-text
- `frontend/index.html:9` — meta description
- `frontend/index.html:18,21` — OG/Twitter meta descriptions

The claim counts columns across all three modes (NFL + college + prospects) combined. A single mode (NFL) has ~85 columns.

## Fix

Either:
1. Verify the actual total across all modes and update the number if it's different
2. Change to "100+ NFL stat columns" (verifiable) or "150+ across NFL, college, and prospects" (more specific)

## Accept When

- The stat column claim on the hero is accurate and verifiable
