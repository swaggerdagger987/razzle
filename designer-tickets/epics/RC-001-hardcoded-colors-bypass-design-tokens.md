<!-- PM: root cause -->
---
id: RC-001
priority: P2
type: root cause
status: open
tickets: 200, 201, 202, 306, 307
---

# Root Cause: Hardcoded colors bypass the design token system

## Pattern

4+ tickets describe the same underlying issue: color values are hardcoded as raw hex/RGBA strings instead of reading from CSS variables or shared JS constants. This affects:

- **200** — canvas overlay uses cold `rgba(0,0,0)` / `rgba(255,255,255)` instead of warm tints
- **201** — getHeatColor() has 12 inline RGBA strings not tied to design tokens
- **202** — PNG export has 4 hardcoded hex fallbacks
- **306/307** — 10 standalone pages duplicate export watermark colors inline

## Why this keeps happening

There is no enforced pattern for "get a color in JS." Some code reads CSS vars via `getComputedStyle`, some uses `getCanvasTheme()`, most just hardcodes. Without a single obvious function to call, every new page copy-pastes colors.

## Suggested systemic fix

1. Expand `getCanvasTheme()` in app.js to cover all canvas/export color needs (overlay, heat, watermark)
2. Add `getExportColors()` to app.js (ticket 305 does this)
3. Lint rule or grep check: flag any raw `rgba(` or hardcoded hex in standalone HTML `<script>` blocks

## Execution order

Fix 305 (shared function) first, then sweep 200-202 and 306-307. Each is a separate ticket.
