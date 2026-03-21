---
id: 20260320-200009-009
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Lab
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Screener PNG export watermark should include a shareable URL, not just the domain

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html (screener export)
**Found by**: Razzle (CEO Review)

The PNG export watermark currently shows "razzle.lol" (and possibly the tagline). This is good but incomplete. Every screenshot is a billboard, and every billboard should have a clickable direction.

When someone sees a Razzle screenshot on Reddit or in a group chat, they need to be able to type a URL and land on the EXACT view that was screenshotted. The watermark should include the full shareable URL for that specific screener state.

**BEFORE** (what it is now):
- Watermark text: "razzle.lol -- let's razzle dazzle em baby"
- No link to the specific screener view
- When someone sees the screenshot, they go to razzle.lol but can't find the exact view

**AFTER** (what it should be):
- Watermark text: "razzle.lol" (domain, prominent)
- Below or beside it: the full shortened URL for the current screener state (e.g., "razzle.lol/lab?f=breakout&s=ppg_desc")
- If the URL is too long, use a short hash: "razzle.lol/v/a3f9d2" (server-side URL shortener that resolves to the full state URL)
- The tagline "let's razzle dazzle em baby" can stay as small text -- it's charming
- Also add a subtle "shared from Razzle" attribution badge in the corner

**WHY**: The growth flywheel depends on screenshots. A screenshot with just "razzle.lol" gets the visitor to the landing page. A screenshot with the full URL gets the visitor to the exact view -- and they immediately see the same data, same filters, same magic that made the original user share it. This is the difference between "cool website" and "oh my god this exact filter shows me something I've never seen." The URL in the watermark closes the loop on the viral share.

### Task 1: Include shareable URL in PNG export watermark
**Accept when**: PNG export includes the full shareable URL for the current screener state in the watermark, positioned below the domain name. The URL resolves to the exact view when typed into a browser.
