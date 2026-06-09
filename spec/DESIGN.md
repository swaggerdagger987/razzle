# Design Guide

**`packages/ui/tokens.css` is the source of truth for values. This doc explains intent.**

## Brand

- **Name:** Razzle · **Domain:** razzle.lol · **Tagline:** The fantasy football research lab. Forever free.
- **Mascot:** Bengal tiger — Chief of Staff, gigachad Garfield energy, toylike, unbothered, slightly smug.
- **Personality:** Film room junkie friend. Earnest, precise, dry wit in the margins. Never tries to look impressive — just IS impressive once you use it.
- **Voice:** Razzle doesn't hedge. "Start him," not "consider starting." Confident, not arrogant.
- **On a win:** let users say it ("Razzle called it"). **On a loss:** "Put our best effort in. Ball up top." No excuses.

## Philosophy

Razzle looks like it shouldn't be as powerful as it is. Warm, playful, comic-strip energy — chunky borders, handwritten annotations, sticker elements — and razor-sharp data underneath. **The contrast IS the brand.** Think Luffy: goofy outside, strongest in the room.

Not this: every dark-mode fintech/AI dashboard. This: a Sunday comics page that runs a research lab your league doesn't know about yet.

## Color

### Backgrounds — "Anthropic Sand"
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#ede0cf` | Page background — warm sand |
| `--bg-warm` | `#e5d5c3` | Toolbars, table headers |
| `--bg-card` | `#f7efe5` | Cards, elevated surfaces |
| `--bg-ink` | `#1a110a` | Situation Room dark only — deepest espresso |

### Ink — "Espresso" (warm brown, never blue-black)
| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#2d1f14` | Primary text, borders, shadows |
| `--ink-medium` | `#5c4a3d` | Body text |
| `--ink-light` | `#8a7565` | Labels, metadata |
| `--ink-faint` | `#c4b5a5` | Dividers, dashed borders |

### Dark mode — "Espresso Flip"
Toggle via `[data-theme="dark"]` on `<html>`, persisted in localStorage. Sand and espresso swap; accents stay. Not the default. Light tints shift to muted deep versions. **The Situation Room always uses `--bg-ink` regardless of toggle** — playful chrome steps aside, contrast is intentional.

### Accents
| Token | Hex | Role |
|-------|-----|------|
| `--orange` | `#d97757` | **Tiger terracotta.** CTAs, brand, WR |
| `--yellow` | `#ffc857` | Highlights, Razzle briefings |
| `--green` | `#2ec4b6` | Positive signals, RB, hot stats |
| `--blue` | `#5b7fff` | NCAA/prospects, QB |
| `--red` | `#e63946` | Urgent, negative |
| `--purple` | `#8b5cf6` | TE, secondary accent |

### Position colors (always consistent)
QB = blue `#5b7fff` · RB = teal `#2ec4b6` · WR = terracotta `#d97757` · TE = purple `#8b5cf6`

## Typography — three fonts, three jobs

1. **Garfield / Luckiest Guy** (`--font-display`) — headings, player names, nav, buttons. Chunky, wobbly, playful.
2. **Space Mono** (`--font-mono`) — all stat values, evidence, timestamps. Clean, technical.
3. **Caveat** (`--font-hand`) — annotations, scribbles, asides, loading states. **Never primary information.**

Scale: 32/700 display page titles · 20/700 display player names · 16/700 display section headers · 14 mono body/buttons · 13 mono data rows · 12/700 mono badges · 11/700 display uppercase labels · 24/600 Caveat annotations.

## Visual language — "Chunky"

- **Radius tokens:** `--radius-sm` 8px (inputs, badges) · `--radius` 12px (cards — default) · `--radius-lg` 20px (pills, stickers). Use the token.
- **Borders:** 3px solid `var(--ink)` on cards/containers; 2px on chips/badges/buttons; 2px dashed `var(--ink-faint)` for internal dividers.
- **Shadows:** `4px 4px 0 var(--ink)`. Hover lift: `6px 6px 0` + `translate(-2px,-2px)` — interaction feels physical.
- **Cards:** ink border, offset shadow, position-colored 6px top stripe, dashed internal dividers.
- **Stickers/tier badges:** slightly rotated (`rotate(3deg)`) — slapped on, not placed.
- **Buttons:** `btn-chunky` (outlined, lifts) and `btn-primary` (filled orange, ink border, pre-offset shadow).

## Loading states

Personality, not spinners: *"pulling film..."* (screener) · *"checking the tape..."* (data sync) · *"running the numbers..."* (formulas).

## Copy

Clean, confident, slightly warm. Never shouty — period over exclamation mark. Assumes you're smart enough to be here. Dry wit in margins (Caveat), never headlines. Watermark: *"razzle.lol — let's razzle dazzle em baby"*. Voice rules: `spec/VOICE.md`.

## NCAA

NFL/NCAA toggle in screener toolbar; NCAA active shifts toolbar to `--blue-light`; prospect cards get blue PROSPECT badge; blue is the college color throughout.

## Do / Don't

**Do:** chunky borders + offset shadows · tilted stickers · Caveat margin notes · Space Mono for data · consistent position colors · hover-lift.

**Don't:** blue-black/navy/charcoal ink (always espresso brown) · thin 1px borders on primary elements · gradients · generic spinners · over-explaining in UI · Caveat for critical info · more than one accent per component · cold grays anywhere — even dark mode stays warm.
