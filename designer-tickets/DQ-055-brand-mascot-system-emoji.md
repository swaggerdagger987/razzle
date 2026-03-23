---
id: DQ-055
priority: P2
category: brand identity
pages: index.html, about.html, 404.html, agents.html (+ all pages via nav logo)
status: open
---

# Brand mascot is a system emoji with no custom illustration

## What's wrong

The Razzle brand mascot — described in DESIGN.md as "Bengal tiger, toylike, chunky, unbothered, slightly smug" — is rendered using the system emoji `🐯` everywhere:

- Nav logo: line 624 `<div class="logo-mark">🐯</div>` (appears on every page)
- Hero: line 643 `<div class="hero-mascot">🐯</div>` (80px, rotated -3deg)
- 404 page: line 154 `🐯`
- About page: emoji in hero
- Agent demo cards: line 767 `🐯 Razzle`

No custom mascot image exists — `frontend/assets/` has no tiger/mascot/razzle PNG/SVG.

System emoji render completely differently across platforms:
- Windows: 3D fluffy tiger
- Apple: flat cartoon tiger
- Google/Android: different cartoon style
- Samsung: yet another style

The brand identity depends on an uncontrolled asset.

## Evidence

- `grep -r "🐯" frontend/` — found in index.html (3x), 404.html, about.html, agents.html
- `ls frontend/assets/*mascot*` — no files found
- `ls frontend/assets/*tiger*` — no files found
- `ls frontend/assets/*razzle*` — no files found

## Fix

Commission or create a custom SVG mascot illustration and replace all emoji instances:
1. Create `frontend/assets/razzle-mascot.svg` (small, ~5KB)
2. Replace `🐯` in logo-mark with `<img src="/assets/razzle-mascot.svg" alt="Razzle" width="32" height="32">`
3. Replace hero-mascot emoji with mascot image at 80px
4. Update 404, about, agent demo cards

The mascot should match DESIGN.md: "toylike, chunky, unbothered, slightly smug."

## Files
- `frontend/index.html` (lines 624, 643, 767)
- `frontend/404.html` (line 154)
- `frontend/about.html`
- `frontend/agents.html`
- All pages via nav logo
