# DES-174: Home page hero uses emoji 🐯 instead of designed Razzle SVG

**Priority**: P3
**Category**: Brand Identity
**Affects**: index.html hero section — the first thing every visitor sees
**Cycle**: 16

## Problem

The home page hero mascot uses the 🐯 emoji (Unicode tiger face). This emoji renders differently on every platform:
- Apple: cute orange face
- Google: realistic tiger with teeth
- Samsung: cartoon tiger head
- Windows: flat colored tiger

The designed Razzle tiger SVG exists at `/assets/agents/razzle.svg` — a consistent brand asset that looks the same everywhere. But it's only used in the Situation Room and agent panels, not on the hero.

The nav logo also uses 🐯 emoji (line 624).

## Evidence

`index.html:643`:
```html
<div class="hero-mascot">🐯</div>
```

`index.html:624`:
```html
<div class="logo-mark">🐯</div>
```

The designed asset exists:
```
frontend/assets/agents/razzle.svg — terracotta tiger SVG (viewBox 20x20)
```

## Fix

Replace the hero emoji with the designed SVG at a larger size:
```html
<div class="hero-mascot">
  <img src="/assets/agents/razzle.svg" alt="Razzle" width="80" height="80">
</div>
```

For the logo, the emoji may be intentional (compact, works at 16px). But the hero — the first visual impression — should use the designed brand asset.

## Why it matters

Brand consistency at the front door. Every Twitter link, every Reddit post drives traffic to the home page. The hero mascot is the first visual impression. It should look the same on every device.
