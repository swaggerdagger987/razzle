---
id: DQ-399
priority: P2
area: agents.html
section: config panel
type: ux / accessibility
status: open
---

# Agents API key config inputs have aria-labels only — no visible text labels

## What's wrong

agents.html lines 1667, 1679, 1686: the API key configuration inputs for OpenRouter, OpenAI, and Anthropic have `aria-label` attributes but no visible `<label>` elements above them.

Non-technical users who need to set up their API key see:
- Three empty text inputs with placeholder text "paste your API key here"
- No visible label explaining WHICH input is for WHICH service
- No visible explanation of what an API key IS or WHERE to get one

The setup guide div (line 1820) exists but is `display:none` by default. Users who need it most can't find it.

## Where

- `frontend/agents.html` line 1667: OpenRouter input
- `frontend/agents.html` line 1679: OpenAI input
- `frontend/agents.html` line 1686: Anthropic input
- `frontend/agents.html` line 1820: hidden setup guide

## Suggested fix

1. Add visible `<label>` elements above each input: "OpenRouter API Key", "OpenAI API Key", "Anthropic API Key"
2. Make the setup guide visible by default (collapsed, not hidden)
3. Add a "Where do I get an API key?" link next to each label

## Not a dupe of

- DQ-384 (mini-screener position tabs no focus-visible) — different page, different element
- DQ-390 (hero mascot no aria-label) — that's about emoji accessibility, not form labels
