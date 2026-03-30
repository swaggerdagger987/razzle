<!-- PM: ready -->
---
id: DES-340
priority: P2
area: index.html
section: Situation Room preview
type: visual / conversion
status: open
---

# Home page Situation Room demo shows only text briefings — pixel canvas not previewed

## What's wrong

The "AI AGENTS THAT ALREADY KNOW YOUR RIVALS" section on the home page shows a dark demo container with text-based briefing cards. But the Situation Room's most visually impressive feature — the pixel canvas with animated agent sprites walking around a war room — is completely absent from the preview.

The text briefings look like generic AI chat output. The pixel canvas is what makes the Situation Room UNIQUE and visually stunning. A Reddit user scrolling past would not stop for text briefings but WOULD stop for a pixel art war room with animated tiger sprites.

## Where

`frontend/index.html` — the Situation Room demo section. The demo renders briefing card examples but does not include even a static screenshot of the pixel canvas.

## Evidence

Screenshots: home-bureau-demo.png, agents-desktop.png — the home page demo is a narrow dark card with text. Compare to the actual Situation Room page which has a full pixel canvas with animated sprites, desks, and a turf war table.

## Suggested fix

1. Add a static screenshot or animated GIF of the pixel canvas above the briefing demos
2. Or embed a miniature non-interactive canvas preview (even a 400x250 snapshot)
3. The visual should show: pixel agents walking, desks, the war room aesthetic
4. Caption in Caveat: "your analysts are already working"

## Why this matters

Per DESIGN.md, the Situation Room is the premium upgrade product. The home page is selling it with its least impressive feature (text output) instead of its most impressive feature (the pixel canvas). This is like selling a sports car with a photo of the trunk.
