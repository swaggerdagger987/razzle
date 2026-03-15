# Mascot System Design — Razzle Vinyl

**Date**: 2026-03-14
**Status**: Approved
**Scope**: Character design, rarity system, ambient presence, prompt library

---

## Art Style: "Razzle Vinyl"

Vinyl toy proportions (Pop Mart / Labubu DNA) with chunky illustration outlines (Duolingo / Headspace weight). Not a copy of either — Razzle's own design language.

### Core Rules

- **Head-to-body ratio**: 3:1. Head is the character. Body is just enough for limbs.
- **Outlines**: 3px solid espresso brown (`#2d1f14`) — matches site border language
- **Fill**: Flat colors, no gradients, no shading. One white accent highlight dot on each eye.
- **Shapes**: All rounded. No sharp corners on bodies. Ears/horns/tails can have points.
- **Expression**: All personality lives in **mouth and eyes**. Each character has a signature expression.
- **Size consistency**: All characters fit the same bounding box. The elephant isn't bigger than the penguin — they're toys from the same set.
- **Default pose**: 3/4 front-facing, slight head tilt. The "box art" pose.
- **Background**: Always transparent PNG. Never baked into a scene.
- **Palette**: Each character uses their role color as primary accent (scarf, hat, accessory, or marking) against their natural animal tone.

---

## The Roster

| # | Name | Animal | Role | Color | Accent |
|---|------|--------|------|-------|--------|
| 0 | Razzle | Bengal Tiger | Chief of Staff | `#d97757` terracotta | Scarf/bandana |
| 1 | Shellsworth | Turtle | Medical Analyst | `#5b7fff` blue | Medical cross on shell |
| 2 | Jax | Monkey | Scout | `#2ec4b6` teal | Headband |
| 3 | Vex | Chameleon | Diplomat | `#8b5cf6` purple | Bowtie |
| 4 | Tux | Penguin | Quant | `#e87422` orange | Pocket square |
| 5 | Stomps | Elephant | Historian | `#d44040` red | Fez or reading glasses |

### Character Briefs

#### 0. Razzle — Bengal Tiger (Chief of Staff)
- **Palette**: Orange fur, espresso stripes, terracotta scarf/bandana
- **Expression**: Half-lidded eyes, slight smirk. Knows something you don't.
- **Signature detail**: Tiny clipboard tucked under one arm. Or nothing — he doesn't need props.
- **Peek behavior**: Ears and eyes over panel edge, one eyebrow raised
- **Vibe**: "I already ran the numbers. Sit down."

#### 1. Shellsworth — Turtle (Medical Analyst)
- **Palette**: Sage green shell, blue medical cross on shell
- **Expression**: Concerned squint. Always diagnosing.
- **Signature detail**: Tiny stethoscope around neck
- **Peek behavior**: Head slowly extending out from side of panel, cautious
- **Vibe**: "I need to see the MRI before I clear him."

#### 2. Jax — Monkey (Scout)
- **Palette**: Brown fur, teal headband
- **Expression**: Wide eyes, open grin. Saw something before you did.
- **Signature detail**: Binoculars hanging from neck or pushed up on forehead
- **Peek behavior**: Hanging upside-down from panel top, tail curled around edge
- **Vibe**: "Already watched the tape. Twice."

#### 3. Vex — Chameleon (Diplomat)
- **Palette**: Base green that shifts — purple as dominant accent
- **Expression**: One eye looking at you, one eye looking elsewhere. Sly half-smile.
- **Signature detail**: Curled tail, tiny bowtie
- **Peek behavior**: One swivel eye peeking around panel corner, rest of body hidden
- **Vibe**: "I got his agent on the phone already."

#### 4. Tux — Penguin (Quant)
- **Palette**: Classic black/white, orange beak and feet, tiny orange pocket square
- **Expression**: Deadpan. Completely unimpressed. Mouth is a flat line.
- **Signature detail**: Tiny round glasses
- **Peek behavior**: Rising up from bottom of panel, just eyes and top of head visible
- **Vibe**: "The model says no. I don't care about your gut feeling."

#### 5. Stomps — Elephant (Historian)
- **Palette**: Grey, red fez or reading glasses
- **Expression**: Warm, knowing smile. Seen this before.
- **Signature detail**: Small book tucked under trunk, or trunk holding a coffee mug
- **Peek behavior**: Trunk curling around panel edge, rest of face slowly appearing
- **Vibe**: "This is the 2017 Mahomes draft all over again. Let me explain."

---

## Rarity System

Triggered on PNG screenshot downloads from The Lab.

### Roll Mechanics

**Step 1 — Character roll**: 1/6 chance any agent appears on the watermark
- 5/6 downloads: standard text watermark ("razzle.lol") only
- 1/6 downloads: a character appears in the corner

**Step 2 — Rarity roll** (when a character appears):

| Tier | Chance (of 1/6) | Effective per-download | Visual Treatment |
|------|-----------------|----------------------|------------------|
| Common | 60% | ~10% | Standard colors, espresso outline |
| Uncommon | 25% | ~4% | Alternate colorway (night palette / inverted accent) |
| Rare | 12% | ~2% | Chrome/metallic sheen, slightly larger |
| Legendary | 3% | ~0.5% | Full gold, subtle glow, signature pose variant |

### Discovery Rules
- No UI announces the rarity system. No tooltip. No guide page.
- Users discover it organically through repeated downloads.
- The first Reddit post asking "has anyone else gotten a gold penguin?" is the marketing plan.

---

## Ambient Presence System

Characters appear throughout the site in non-intrusive positions.

### Placement Rules
- Only in **margins, panel edges, and empty states** — never overlapping content
- Max **1 character visible per page load** (keeps it special)
- **Randomized per session** — different character, different position each time
- **CSS-positioned PNGs** with z-index behind content edges, overflow hidden for "peeking" crop
- Click a peeking character: nothing happens, or they blink. Keep it subtle.

### Empty State Characters
- No search results → Tux deadpan stare: *"The model returned zero results."*
- Loading state → Jax hanging upside-down, binoculars out
- Error state → Shellsworth looking concerned

---

## Prompt Library Page

A free page at `/prompts`.

### Purpose
Keep free users engaged in the Razzle ecosystem without paid AI agents. They use Razzle's data + screenshots, then run their own LLM.

### Structure
- Copy-paste prompts organized by use case: trade analysis, roster evaluation, draft prep, waiver pickup
- Each prompt designed to work with a Lab screenshot uploaded to Claude/ChatGPT/etc.
- **"Download Screenshot" CTA** on each prompt card — this is where the rarity roll triggers
- Ambient character presence on the page (peeking from sidebar)

### Funnel
1. User explores The Lab (free)
2. Finds something interesting, wants analysis
3. Goes to `/prompts`, picks a relevant prompt
4. Downloads screenshot (rarity roll happens here)
5. Uploads to their LLM with the prompt
6. Gets value → comes back → notices characters → shares screenshots → free virality

---

## Production Pipeline

### Phase 1: Concept Art (Now)
- AI-generate (Midjourney/Flux) all 6 characters in signature pose
- Goal: nail personality and proportions
- Output: 1 transparent PNG per character, front-facing "box art" pose
- Validate: does each character read at thumbnail size? Is the set cohesive?

### Phase 2: Asset Expansion (Post-validation)
- Peek variants: head-only crops at various angles (top, left, right, bottom)
- Rarity tier color variants: 4 tiers × 6 characters = 24 watermark assets
- 16×24 pixel sprite adaptations for War Room canvas
- Empty state illustrations (3-4 situational poses)

### Phase 3: Professional Polish (If traction proves it)
- Commission artist for vector redraw of all 6 characters
- Full sprite sheets for War Room animation (7×4 frame grid per character)
- Merch-ready files (SVG, high-res PNG)
- Expanded expression/pose library

---

## AI Prompt Template (Phase 1 Generation)

Base prompt structure for consistency across all 6 characters:

```
A [animal] character in vinyl toy style, 3:1 head-to-body ratio, chunky rounded
proportions, thick dark brown outlines, flat colors with no gradients or shading,
single white highlight dot on each eye, [signature expression], wearing [accent
accessory in hex color], 3/4 front-facing view with slight head tilt, transparent
background, character design sheet style, Pop Mart / designer toy aesthetic,
high quality PNG
```

Customize per character with their specific expression, accessory, and palette.
