# DES-165: JS inline font-size values (40+ instances) bypass design system

**Priority**: P3 (Maintainability — design system compliance)
**Page**: Sitewide (5 JS files)
**Category**: Design system

## The Problem

40+ instances of hardcoded `font-size` in JavaScript inline styles bypass the type scale defined in DESIGN.md. When JS generates HTML with `style="font-size:12px"`, those sizes can't be updated globally, don't respond to user font-size preferences, and create invisible inconsistency.

## Evidence

**app.js** (16 instances):
- 10px (trial info, sleeper username)
- 12px (badge, button text)
- 14px (dialog text, secondary text)
- 18px (emoji, heading, paragraph)
- 24px (close button)
- 28px (heading, h2)
- 40px (emoji)

**agent-nudges.js** (5 instances):
- 11px (agent name, link)
- 13px (nudge container)
- 14px (nudge message, dismiss button)

**lab-panels.js** (20+ instances):
- Various sizes for panel-generated content

**DESIGN.md type scale**: 11px, 12px, 13px, 14px, 16px, 18px, 20px, 24px, 32px — with specific font-family assignments per size.

## The Fix

1. Create CSS utility classes matching the type scale:
   ```css
   .text-xs { font-size: 11px; font-family: var(--font-display); text-transform: uppercase; }
   .text-sm { font-size: 12px; font-weight: 700; font-family: var(--font-mono); }
   .text-body { font-size: 13px; font-family: var(--font-mono); }
   .text-md { font-size: 14px; font-family: var(--font-mono); }
   /* etc. */
   ```
2. Replace inline `style="font-size:Xpx"` with the appropriate class
3. For JS-generated elements, use `el.className = 'text-sm'` instead of `el.style.fontSize = '12px'`

## Why This Matters

The design system defines 9 type scale steps. When JS bypasses it with 14 different hardcoded values (including 10px and 40px which aren't in the scale), the visual hierarchy becomes inconsistent. This is technical debt — not user-visible today, but makes future design updates require hunting through JS files instead of changing one CSS file.
