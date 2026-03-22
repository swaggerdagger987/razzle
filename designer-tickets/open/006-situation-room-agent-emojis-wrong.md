# DES-006: Situation Room agent emojis/animals don't match DESIGN.md characters

**Priority:** P2
**Area:** agents.html (Situation Room hero badges + bio cards)
**Type:** Brand consistency bug

## The Problem

Three of six agents on the Situation Room page have the WRONG animal identity. The emojis and animal labels in `warroom.js` (BIOS array, ~line 3090) and the hero badges in `agents.html` (~line 1598) don't match the characters defined in DESIGN.md.

| Agent | DESIGN.md Identity | agents.html Emoji | warroom.js Animal | Should Be |
|-------|--------------------|-------------------|-------------------|-----------|
| Razzle | Bengal Tiger | 🐯 | Bengal Tiger | OK |
| Medical | **Dr. Dolphin** | 🦉 Owl | **Owl** | **🐬 Dolphin** |
| Scout | Hawkeye (hawk) | 🦅 Eagle | Eagle | OK (close enough) |
| Diplomat | **The Fox** | 🐻 Bear | **Bear** | **🦊 Fox** |
| Quant | **The Octopus** | 🦊 Fox | **Fox** | **🐙 Octopus** |
| Historian | The Elephant | 🐘 Elephant | Elephant | OK |

The home page gets it right: line 763 shows `🦊 The Diplomat`. But the Situation Room shows `🐻 Diplomat` for the same character and puts 🦊 on the Quant instead. A user who clicks "Meet the agents" from the home page lands on a page where the fox emoji has jumped to a different agent.

## Why It Matters

The agents ARE their animals. "Dr. **Dolphin**" is a dolphin. "The **Fox**" is a fox. "The **Octopus**" is an octopus. Showing an owl, bear, and fox instead breaks the character identity that the connective tissue design doc (docs/plans/2026-03-20-agent-connective-tissue-design.md) builds the entire "earned discovery" journey around.

This page is the Pro/Elite upgrade driver. Users who arrive here from the home page (where The Diplomat has a fox emoji) see the fox emoji on a completely different agent. It's small but it signals "this isn't finished" — exactly the opposite of what converts a curious visitor into a paying user.

## The Fix

**1. agents.html hero badges (~line 1598-1603):**

```html
<!-- BEFORE -->
<span class="agent-badge">🐯 Razzle</span>
<span class="agent-badge">🦅 Scout</span>
<span class="agent-badge">🐻 Diplomat</span>
<span class="agent-badge">🦊 Quant</span>
<span class="agent-badge">🦉 Medical</span>
<span class="agent-badge">🐘 Historian</span>

<!-- AFTER -->
<span class="agent-badge">🐯 Razzle</span>
<span class="agent-badge">🦅 Hawkeye</span>
<span class="agent-badge">🦊 Bones</span>
<span class="agent-badge">🐙 Octo</span>
<span class="agent-badge">🐬 Dr. Dolphin</span>
<span class="agent-badge">🐘 Atlas</span>
```

**2. warroom.js BIOS array (~line 3090-3114):**

| Current | Fix |
|---------|-----|
| `{ name: 'Medical', animal: 'Owl', emoji: '🦉' ...}` | `{ name: 'Dr. Dolphin', animal: 'Dolphin', emoji: '🐬' ...}` |
| `{ name: 'Diplomat', animal: 'Bear', emoji: '🐻' ...}` | `{ name: 'Bones', animal: 'Fox', emoji: '🦊' ...}` |
| `{ name: 'Quant', animal: 'Fox', emoji: '🦊' ...}` | `{ name: 'Octo', animal: 'Octopus', emoji: '🐙' ...}` |
| `{ name: 'Scout', animal: 'Eagle', emoji: '🦅' ...}` | `{ name: 'Hawkeye', animal: 'Eagle', emoji: '🦅' ...}` |
| `{ name: 'Historian', animal: 'Elephant', emoji: '🐘' ...}` | `{ name: 'Atlas', animal: 'Elephant', emoji: '🐘' ...}` |

Names should match `agent-config.js` (the single source of truth for agent identity): Dr. Dolphin, Hawkeye, Bones, Octo, Atlas.

## Verification

1. Open agents.html — hero badges should show correct animal emojis
2. Scroll to bio cards — each agent should have correct emoji + animal label
3. Open index.html — The Diplomat (🦊) emoji should match what agents.html shows for the same character
4. Cross-check with `frontend/agent-config.js` — names should be consistent
