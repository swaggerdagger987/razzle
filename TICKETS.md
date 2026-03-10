# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## TICKET 1: Brand Voice + Watermark Update

**Phase Name**: Brand Voice — Watermark, Copy, Personality Pass
**Exit Criterion**: All watermarks updated to new tagline. All UI copy matches brand identity (film room energy, peer tone, no corporate language). Loading states, error states, empty states, tooltips, 404 page all have personality. Export PNGs carry new watermark. Deployed to Render.

### Task 1: Update all watermarks to new tagline
**Requirement**: "Replace every instance of 'built different — razzle.lol' with 'razzle.lol — let's razzle dazzle em baby' across the entire codebase. This appears in: (a) Canvas export watermarks in lab.js (at least 10 instances of ctx.fillText with the old watermark). (b) Canvas export watermarks in charts.js (at least 3 instances). (c) HTML watermark divs in lab.html, index.html, agents.html, league-intel.html, player.html, compare.html. (d) SVG files in frontend/assets/og-image.svg and og-image-lab.svg. Search for 'built different' across all files and replace every instance. Do NOT miss any — there are 30+ occurrences."
**Accept when**:
- Zero instances of 'built different' remain in the codebase (grep returns nothing)
- All canvas exports show new watermark text
- All HTML footer watermarks show new text
- All SVG OG images show new text
- PNG export from Lab shows "razzle.lol — let's razzle dazzle em baby"
**Depends on**: none
**Size**: M

### Task 2: Brand voice pass on all UI copy
**Requirement**: "Audit and update all user-facing copy to match the Razzle brand voice (peer energy, film room vibe, slightly smug, never corporate). Reference the brand identity doc at C:\Users\mcgui\Desktop\McGuire\Projects\Razzle\Brand Identity.md for voice rules. Updates needed: (a) Loading states — verify they use film room language: 'pulling film...', 'checking the tape...', 'crunching the numbers...', 'running the numbers...'. If any say 'Loading...' or 'Please wait...', replace with brand-appropriate copy. (b) Error states — replace generic errors with personality: 'Something broke. Razzle's on it.' or 'That didn't work. Try again — Razzle doesn't give up easy.' (c) Empty states — replace 'No results' with 'No results. Try loosening those filters — not everyone can be elite.' or similar. (d) 404 page — should say 'This page got cut from the roster. Head back to the Lab.' if it doesn't already. (e) Home page CTA — update to: 'The terminal is free. The agents know your league. razzle.lol' (f) Upgrade prompt on War Room paywall — update to: 'Razzle knows every manager in your league. What they panic-buy, when they sell low, who they overpay. $240/year.'"
**Accept when**:
- Zero instances of generic 'Loading...' or 'Please wait' in the codebase
- All loading states use film room language
- Error states have personality
- Empty states have personality
- 404 page has brand-appropriate copy
- Home page CTA matches brand voice
- War Room upgrade prompt matches brand voice
**Depends on**: none
**Size**: M

### Task 3: Tooltip voice pass
**Requirement**: "Update all column header tooltips to match brand voice — short, useful, slightly warm. Not clinical definitions. Examples: (a) WOPR: 'How much of the passing game runs through this player.' (b) RACR: 'Yards gained per air yard thrown his way. Efficiency in the air.' (c) DAKOTA: 'EPA + completion magic combined. The nerd stat for QB evaluation.' (d) DVS: 'Dynasty value adjusted for age. Higher = more valuable for your future.' (e) TGT%: 'What slice of the team's targets this player eats.' (f) aDOT: 'How deep the average target is. High = field stretcher. Low = underneath guy.' (g) YPRR*: 'Yards earned per route run. The best efficiency stat for receivers. (*estimated)' (h) CPOE: 'How much better (or worse) than expected this QB completes passes.' Review all tooltips and ensure none read like a textbook definition. They should sound like a knowledgeable friend explaining it at a bar."
**Accept when**:
- All tooltips rewritten in brand voice
- No clinical/textbook definitions remain
- Tooltips are concise (one sentence max)
- Tone is warm and peer-like
**Depends on**: none
**Size**: S

### Task 4: Deploy + smoke test brand voice
**Requirement**: "Verify all brand updates: (a) All JS passes syntax check. (b) All watermarks show new tagline. (c) Loading states show film room language. (d) Error states have personality. (e) Tooltips match brand voice. (f) PNG export shows new watermark. (g) Home page CTA updated. (h) No instances of 'built different' remain. Push to master."
**Accept when**: All syntax clean. New watermark everywhere. Brand voice consistent. Committed and pushed to master.
**Depends on**: Tasks 1-3
**Size**: S
