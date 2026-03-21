---
id: 20260320-170021-021
severity: P1
confidence: HIGH
flow: global
flow_name: Global — Rarity System on Screenshot Watermarks
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build rarity system on screenshot watermarks with 1/6 character appearance chance

**PRIORITY: P1** | **Type: structural**
**Page**: all pages with screenshot export
**Design doc**: docs/NORTH_STAR.md

When users export screenshots (screener results, Bureau odds, agent analysis), the watermark should include a randomly selected Razzle character with a 1/6 chance for each of the 6 agents (Razzle, Hawkeye, Bones, Octo, Atlas, and a rare hidden character). This creates collectibility and social sharing incentive — users will screenshot more to "collect" rare watermarks. The character appears as a small sprite in the watermark corner alongside the "razzle.lol" branding.

### Task 1: Implement randomized character watermarks
**Accept when**: Every screenshot export includes a small character sprite in the bottom-right corner. Each of the 6 characters has equal 1/6 probability. The character is visually distinct and recognizable at watermark size (roughly 32x32px). The watermark also includes "razzle.lol" text. Users on social media will notice and compare which characters they got.
