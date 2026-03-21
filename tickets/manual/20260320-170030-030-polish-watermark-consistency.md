---
id: 20260320-170030-030
severity: P2
confidence: HIGH
flow: global
flow_name: Polish — Screenshot Watermark Consistency
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Ensure consistent "razzle.lol" watermark on all screenshot exports

**PRIORITY: P2** | **Type: structural**
**Page**: all pages with screenshot export
**Design doc**: docs/DESIGN.md

Every screenshot export across the app should include a consistent watermark: "razzle.lol -- let's razzle dazzle em baby" in Caveat font, positioned at the bottom of the exported image. The watermark should be semi-transparent, use terracotta color, and not obscure the main content. Audit all export functions (Lab screener, Bureau odds, Situation Room responses) to ensure the watermark is applied uniformly.

### Task 1: Standardize watermark across all export functions
**Accept when**: Every screenshot export function produces an image with the watermark "razzle.lol -- let's razzle dazzle em baby" in Caveat font at the bottom. The watermark is consistent in font, size, color (terracotta at 60% opacity), and position across all export points. No export produces a screenshot without the watermark. The watermark is applied via a shared utility function, not duplicated code.
