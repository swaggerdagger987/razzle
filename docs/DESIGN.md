# Razzle Design Guide

**Status**: Approved
**Date**: 2026-03-08
**Visual reference**: `index.html` (open in browser to see the full theme prototype)

---

## Brand

- **Name**: Razzle
- **Domain**: razzle.lol
- **Tagline**: The fantasy football research lab. Forever free.
- **Mission**: "Testing weekly what's stronger — our bad luck or the numbers. Come join us."
- **Mascot**: Bengal tiger — Chief of Staff, gigachad Garfield energy, toylike, unbothered, slightly smug
- **Personality**: Film room junkie friend. Earnest, slightly obsessive about precision, dry wit in the margins. Never tries to look impressive — just IS impressive once you use it.
- **Voice**: Razzle doesn't hedge. Other tools say "consider starting" — Razzle says "start him." No ifs, buts, or maybes — just absolutes. The agents provide analysis, Razzle delivers the verdict with conviction. Confident, not arrogant. Direct, not reckless.
- **On a win**: Let the users say it. "Razzle called it." Don't celebrate yourself.
- **On a loss**: "Put our best effort in. Ball up top." No excuses, no blame, no "well technically the model was right." Head up, next week.
- **Positioning**: Razzle is a fantasy football research lab. The Screener is forever free — no catch, no trial, no bait-and-switch. 70+ analytical panels, custom formulas, and the Situation Room (AI agents with full league context) are the paid upgrade. The brand line is: **"The Screener is forever free. The intelligence is what you pay for."** Use "forever free" deliberately and proudly — it's a trust signal, not a defense.

### Brand Hierarchy
1. **The Screener (Forever Free)** — The front door. When someone says "have you used Razzle?" they mean the Screener. Every screenshot, every shareable URL, every Reddit post comes from here. Forever free, no strings.
2. **The Lab Panels (Pro)** — The depth. 70+ analytical panels behind the Screener — dynasty rankings, trade values, breakouts, aging curves, and more. This is what turns a curious visitor into a paying user.
3. **The Bureau (Free, Sleeper-linked)** — The hook. Connecting Sleeper makes Razzle personal. It is the bridge between "cool free tool" and "I need this." Free to connect. Monte Carlo league odds (summary cards) are free — deep-dive is Pro.
4. **The Situation Room (Pro)** — The upgrade. AI agents with full league context. Never the first thing a user sees. It earns attention through the Screener and Bureau, not through hero positioning.

---

## Design Philosophy

Razzle looks like it shouldn't be as powerful as it is. Warm, playful, comic-strip energy — chunky borders, handwritten annotations, sticker-like elements. The data underneath is razor sharp. The contrast IS the brand.

Think Luffy: goofy on the outside, strongest person in the room.

**Not this**: every dark-mode fintech/AI dashboard
**This**: a Sunday comics page that runs a research lab your league doesn't know about yet

---

## Color Palette

### Backgrounds — "Anthropic Sand"
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#ede0cf` | Page background — warm sand |
| `--bg-warm` | `#e5d5c3` | Toolbars, subtle sections, table headers |
| `--bg-card` | `#f7efe5` | Cards, elevated surfaces |
| `--bg-ink` | `#1a110a` | Situation Room dark mode only — deepest espresso |

### Ink — "Espresso"
The ink palette is warm espresso brown, not blue-black. Brown on sand is the Razzle signature — everything feels like one material, leather and parchment, not screen and pixels.

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#2d1f14` | **Espresso.** Primary text, borders, shadows |
| `--ink-medium` | `#5c4a3d` | Body text, secondary content |
| `--ink-light` | `#8a7565` | Labels, metadata, timestamps |
| `--ink-faint` | `#c4b5a5` | Dividers, dashed borders |

### Dark Mode — "Espresso Flip"
Dark mode inverts the sand/espresso relationship. Espresso becomes background, sand becomes text. The orange accent stays the same — it works on both. Toggle via `[data-theme="dark"]` on `<html>`.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg` | `#ede0cf` sand | `#2d1f14` espresso |
| `--bg-warm` | `#e5d5c3` warm sand | `#3b2821` warm espresso |
| `--bg-card` | `#f7efe5` cream | `#4a3728` mocha |
| `--ink` | `#2d1f14` espresso | `#ede0cf` sand |
| `--ink-medium` | `#5c4a3d` medium brown | `#c4b5a5` medium sand |
| `--ink-light` | `#8a7565` light brown | `#8a7565` (shared) |
| `--ink-faint` | `#c4b5a5` faint brown | `#5c4a3d` dark dividers |

Light tints also shift in dark mode to muted deep versions (e.g., `--orange-light` goes from `#f7e4d8` to `#5c3325`).

**Rule**: Dark mode is available site-wide via toggle. It is NOT the default. The Situation Room still uses its own `--bg-ink` deepest-dark override.

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
| 14px | 400/600 | Mono | Body text, nav links, buttons |
| 13px | 400 | Mono | Stat values, data rows |
| 12px | 700 | Mono | Badges, chips, small data |
| 11px | 700 | Display (uppercase) | Section labels, uppercase tags |
| 24px | 600 | Caveat | Handwritten annotations |
| 18px | 500 | Caveat | Card scribbles, smaller notes |

---

## Visual Language

### Border Radius Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `8px` | Inputs, small badges, pricing badges, info boxes |
| `--radius` | `12px` | Cards, containers, modals — the default |
| `--radius-lg` | `20px` | Pills, chips, agent badges — sticker-shaped |

Use the token, not a hardcoded value. New components should pick the nearest token.

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

### Dark Mode Toggle
Users can toggle dark mode site-wide. The espresso flip inverts sand ↔ brown while keeping all accents, position colors, and personality intact. Implementation: set `data-theme="dark"` on `<html>`, CSS variables handle the rest. Persist preference in localStorage.

### The Situation Room Exception
Situation Room uses `--bg-ink` (deepest espresso `#1a110a`) regardless of theme toggle. It's always dark. Playful chrome steps aside. Contrast is intentional.

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
- Watermark: "razzle.lol — let's razzle dazzle em baby"

---

## Mascot — Razzle

Bengal tiger. Chief of Staff. Runs the whole operation.
- Toylike, chunky, unbothered
- Smartest one in the room and knows it
- Doesn't brief you because he has to — briefs you because he's already figured it all out
- Energy: cat who knocked your projections off the table then showed you better ones
- Traits: unbothered, always right, slightly smug, your GM

## Agents

Six AI agents staff the Situation Room. Each has a distinct personality and analytical lens.

- **Razzle** (Bengal Tiger) — Chief of Staff. Orchestrates all agents, delivers prioritized briefings, triages into URGENT / MONITOR / OPPORTUNITY. Doesn't hedge — "no ifs, buts, or maybes. Absolutes." Other tools say "consider starting." Razzle says "start him."
- **Dr. Dolphin** (Medical) — Injury intelligence. Recovery timelines, return-to-play modeling, performance impact projections. Flags buy-low and sell-high windows around injuries.
- **Hawkeye** (Scout) — Usage trends, snap counts, breakout detection, waiver targets. The film room analyst who catches things the box score misses.
- **The Fox** (Diplomat) — Trade negotiation and competitive intelligence. Models opponent psychology, calculates acceptance probability, gives leverage angles. Knows what your rivals need before they do.
- **The Octopus** (Quant) — Valuations, projections, expected value, championship probability. Leads with the number and the conclusion.
- **The Elephant** (Historian) — League memory and pattern recognition. Knows your league's past trades, your blind spots, the last time this exact scenario played out.

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
- Blue-black ink — always use espresso brown (`#2d1f14`), never navy/charcoal/gray
- Thin 1px borders on primary elements
- Gradients
- Generic loading spinners
- Over-explain in UI — trust the user
- Caveat for critical information
- More than one accent color per component
- Cold grays anywhere — even dark mode stays warm (brown, not gray)
