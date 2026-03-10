# Razzle Loop — Phase 44 Task List

> Consumed from TICKETS.md (Ticket 1).

**Current Phase**: 44 — Brand Voice — Watermark, Copy, Personality Pass
**Exit Criterion**: All watermarks updated to new tagline. All UI copy matches brand identity (film room energy, peer tone, no corporate language). Loading states, error states, empty states, tooltips, 404 page all have personality. Export PNGs carry new watermark. Deployed to Render.

---

## Task 1: Update all watermarks to new tagline
**Status**: PASS
**Result**: Replaced all "built different" with "razzle.lol — let's razzle dazzle em baby". 12 canvas watermarks in lab.js, 3 in charts.js, 5 HTML footers, 1 watermark div, 2 SVG OG images, 1 meta desc, docs/DESIGN.md. Zero instances remain.
**Acceptance Criteria**:
- Zero instances of 'built different' remain in the codebase
- All canvas exports show new watermark text
- All HTML footer watermarks show new text
- All SVG OG images show new text
- PNG export from Lab shows "razzle.lol — let's razzle dazzle em baby"

## Task 2: Brand voice pass on all UI copy
**Status**: PENDING
**Acceptance Criteria**:
- Zero instances of generic 'Loading...' or 'Please wait' in the codebase
- All loading states use film room language
- Error states have personality
- Empty states have personality
- 404 page has brand-appropriate copy
- Home page CTA matches brand voice
- War Room upgrade prompt matches brand voice

## Task 3: Tooltip voice pass
**Status**: PENDING
**Acceptance Criteria**:
- All tooltips rewritten in brand voice
- No clinical/textbook definitions remain
- Tooltips are concise (one sentence max)
- Tone is warm and peer-like

## Task 4: Deploy + smoke test brand voice
**Status**: PENDING
**Acceptance Criteria**:
- All syntax clean
- New watermark everywhere
- Brand voice consistent
- No instances of 'built different' remain
- Committed and pushed to master

---

## Loop State
```
Current Phase: 44
Current Task: 2
Current Stage: BUILD
Attempt: 1
Tasks Completed: 1/4
```
