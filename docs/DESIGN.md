# Razzle Design Guide

**Status**: Approved
**Date**: 2026-03-08
**Visual reference**: `index.html` (open in browser to see the full theme prototype)

---

## Brand

- **Name**: Razzle
- **Domain**: razzle.lol
- **Mascot**: Bengal tiger — Chief of Staff, gigachad Garfield energy, toylike, unbothered, slightly smug
- **Personality**: Film room junkie friend. Earnest, slightly obsessive about precision, dry wit in the margins. Never tries to look impressive — just IS impressive once you use it.

---

## Design Philosophy

Razzle looks like it shouldn't be as powerful as it is. Warm, playful, comic-strip energy — chunky borders, handwritten annotations, sticker-like elements. The data underneath is razor sharp. The contrast IS the brand.

Think Luffy: goofy on the outside, strongest person in the room.

**Not this**: every dark-mode fintech/AI dashboard
**This**: a Sunday comics page that happens to run a Bloomberg terminal

---

## Color Palette

### Backgrounds — "Anthropic Sand"
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#ede0cf` | Page background — warm sand |
| `--bg-warm` | `#e5d5c3` | Toolbars, subtle sections, table headers |
| `--bg-card` | `#f7efe5` | Cards, elevated surfaces |
| `--bg-ink` | `#0f0f1a` | War Room dark mode only |

### Ink
| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#1a1a2e` | Primary text, borders, shadows |
| `--ink-medium` | `#4a4a5e` | Body text, secondary content |
| `--ink-light` | `#8a8a9e` | Labels, metadata, timestamps |
| `--ink-faint` | `#c5c5d0` | Dividers, dashed borders |

### Accents
| Token | Hex | Role |
|-------|-----|------|
| `--orange` | `#d97757` | **Tiger terracotta.** Signature accent — CTAs, WR position, brand, mascot. Claude-esque warmth. |
| `--yellow` | `#ffc857` | Highlights, Razzle briefings, warmth |
| `--green` | `#2ec4b6` | Positive signals, RB position, "hot" stats |
| `--blue` | `#5b7fff` | NCAA/prospect content, QB position |
| `--red` | `#e63946` | Urgent signals, negative stats |
| `--purple` | `#8b5cf6` | TE position, secondary accent |

### Light Tints (warm-shifted for sand background)
- `--orange-light`: `#f7e4d8`
- `--yellow-light`: `#f5eacc`
- `--green-light`: `#d9efec`
- `--blue-light`: `#dde4f7`
- `--red-light`: `#f2d5d8`
- `--purple-light`: `#e5dcf7`

### Position Colors
| Position | Color | Token |
|----------|-------|-------|
| QB | Blue `#5b7fff` | `--pos-qb` |
| RB | Teal `#2ec4b6` | `--pos-rb` |
| WR | Terracotta `#d97757` | `--pos-wr` |
| TE | Purple `#8b5cf6` | `--pos-te` |

---

## Typography — Three Fonts, Three Jobs

### 1. Garfield / Luckiest Guy (Display)
`--font-display`: `'Garfield', 'Luckiest Guy', cursive`

Comic-strip display font. Headings, player names, nav labels, buttons. Chunky, slightly wobbly, unmistakably playful.

### 2. Space Mono (Data)
`--font-mono`: `'Space Mono', monospace`

All stat values, evidence blocks, timestamps, source citations. Clean, technical, no-nonsense.

### 3. Caveat (Handwritten Annotations)
`--font-hand`: `'Caveat', cursive`

Personality that leaks through the seams: section annotations, player card scribbles, agent editorial asides, loading states.

**Rule**: Caveat is never primary information. Always a comment, aside, margin note.

### Type Scale
| Size | Weight | Font | Usage |
|------|--------|------|-------|
| 32px | 700 | Display | Page titles |
| 20px | 700 | Display | Player names, card headers |
| 16px | 700 | Display | Section headers, agent names |
| 14px | 400/600 | Display | Body text, nav links, buttons |
| 13px | 400 | Mono | Stat values, data rows |
| 12px | 700 | Mono | Badges, chips, small data |
| 11px | 700 | Display (uppercase) | Section labels, uppercase tags |
| 24px | 600 | Caveat | Handwritten annotations |
| 18px | 500 | Caveat | Card scribbles, smaller notes |

---

## Visual Language

### Borders & Shadows — "Chunky"
- **Primary border**: 3px solid `var(--ink)` on cards, containers
- **Secondary border**: 2px solid `var(--ink)` on chips, badges, toggles, buttons
- **Dashed dividers**: 2px dashed `var(--ink-faint)` inside cards
- **Box shadows**: `4px 4px 0 var(--ink)` on cards, containers
- **Hover lift**: `6px 6px 0` + `translate(-2px, -2px)`

### Elements
- **Cards**: 3px ink border, offset shadow, position-colored top stripe (6px), hover lifts, dashed internal dividers
- **Chips/Badges**: sticker-shaped, 2px borders, pill-rounded, hover adds shadow + lift
- **Tier Stickers**: slightly rotated (`rotate(3deg)`) — slapped on, not placed
- **Buttons**: `btn-chunky` (outlined, lifts on hover) and `btn-primary` (filled orange, ink border, pre-offset shadow)
- **NFL/NCAA Toggle**: chunky segmented control, ink border, active fills with `var(--ink)`

### Loading States
Personality, not spinners:
- "pulling film..." (screener loading)
- "checking the tape..." (data sync)
- "running the numbers..." (formula calculation)

### The War Room Exception
War Room flips to dark mode (`--bg-ink`). Playful chrome steps aside. Contrast is intentional.

---

## NCAA / College Integration
- NFL/NCAA toggle in screener toolbar
- NCAA active → toolbar shifts to `--blue-light`
- Prospect cards get PROSPECT badge in blue
- College-specific stat labels
- Blue is NCAA color throughout

---

## Voice & Copy
- Clean, confident, slightly warm
- Never shouty. Period over exclamation mark.
- Assumes you're smart enough to be here
- Dry wit in margins (Caveat), never in headlines
- Loading: "pulling film..." not "Loading..."
- Watermark: "built different — razzle.lol"

---

## Mascot — Razzle

Bengal tiger. Chief of Staff. Runs the whole operation.
- Toylike, chunky, unbothered
- Smartest one in the room and knows it
- Doesn't brief you because he has to — briefs you because he's already figured it all out
- Energy: cat who knocked your projections off the table then showed you better ones
- Traits: unbothered, always right, slightly smug, your GM

## Agents
- Razzle (Bengal tiger) = Chief of Staff / orchestrator
- Other agents TBD — will be animals from NFL teams user likes
- Agent roles: scout, medical, intel/diplomat, quant/projections, historian

---

## Do / Don't

**Do:**
- Chunky borders and offset shadows
- Slightly tilted stickers and badges
- Caveat for margin-note personality
- Space Mono for data, always precise
- Position colors consistently (QB=blue, RB=teal, WR=terracotta, TE=purple)
- Hover-lift — interaction should feel physical

**Don't:**
- Dark mode (except War Room)
- Thin 1px borders on primary elements
- Gradients
- Generic loading spinners
- Over-explain in UI — trust the user
- Caveat for critical information
- More than one accent color per component
