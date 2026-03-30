<!-- PM: ready -->
---
id: RC-002
priority: P2
area: design system
section: color tokens
type: root-cause
status: open
related: [207, 208, 209]
---

# Root Cause: Hardcoded color values bypass design tokens

## Pattern

Three separate tickets (207, 208, 209) describe the same underlying problem: code uses hardcoded hex/rgba values instead of DESIGN.md-specified tokens or CSS variables.

| Ticket | File | Hardcoded | Should be |
|--------|------|-----------|-----------|
| 207 | 11 HTML files | `border-radius: 4px` | `8px` or `var(--radius-sm)` |
| 208 | warroom.js | `#ffcc00` / `#ddaa00` | `#ffc857` (--yellow) |
| 209 | player.js | `rgba(0,0,0,0.5)` | warm espresso `rgba(26,17,10,0.7)` |

## Root cause

No lint rule or automated check prevents hardcoded design values. Each standalone page embeds its own `<style>` block, so drift accumulates silently. "Done" tickets (DES-058, DES-075) get marked complete without full verification.

## Systemic fix (optional, after individual tickets)

1. Add a grep-based CI check: `border-radius:\s*[1-7]px` and `rgba(0,0,0` should flag.
2. Move remaining inline `<style>` blocks to shared CSS classes in styles.css.
3. Future pages must use CSS variables, not hex literals, for position colors and design tokens.

## Immediate action

Fix tickets 207, 208, 209 individually (they're already scoped to one file or one pattern each). This ticket tracks the systemic pattern — close it when a preventive check exists or all three child tickets are done.
