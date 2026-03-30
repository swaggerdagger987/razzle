# DQ-105: Home page AI Agents section lacks pixel canvas preview

**Priority**: P2
**Category**: Conversion / Visual Selling
**Page**: index.html (home)
**Evidence**: home-light-desktop.png, home-light-scroll.png

## Problem

The "AI Agents" section on the home page describes the Situation Room and shows agent bio cards + demo briefing cards on dark backgrounds. But the pixel canvas — the most visually unique and shareable feature of the Situation Room — is never shown.

The pixel canvas (walking tiger agents in a pixel art war room) is Razzle's most distinctive visual asset. It's the thing that would get screenshotted and posted to r/DynastyFF. Yet the home page doesn't show it at all. Users see text descriptions and briefing samples, but not the visual experience.

## Fix

Add a static screenshot or embedded preview of the pixel canvas between the agent bio cards and the demo briefing section. Options:

1. A static PNG/WebP screenshot of the pixel canvas at its best state (agents walking, speech bubbles, full room) — wrapped in a chunky bordered card with a slight shadow, like a monitor/screen frame
2. An animated GIF showing 2-3 seconds of agent movement
3. A mini embedded canvas that runs the idle animation (no interactivity needed)

Option 1 is simplest and most impactful. Capture a good screenshot, frame it in a card.

Add a Caveat annotation: "your war room, live." or "they walk around in there."

## Verification

Scroll to the AI Agents section on the home page. The pixel canvas should be visible as a preview image, making users think "I need to see this."
