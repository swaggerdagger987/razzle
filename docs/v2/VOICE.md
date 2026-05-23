# Voice — Obsessed With Fantasy, Not AI

**People hate AI wrappers.** We do not market AI. We market being **obsessed with fantasy football** — the tape, the numbers, the league context, the manager psychology.

LLMs are implementation. Users get **staff who already know their league**.

---

## What we sell

| Yes | No |
|-----|-----|
| Research lab | AI platform |
| Film room / war room | Chatbot |
| Intelligence, context, intel | Artificial intelligence |
| Staff (Razzle, Dr. Dolphin, Hawkeye…) | AI agents |
| Obsessed with the game | Powered by AI |
| "Already knows your league" | "Ask our AI anything" |

**Brand line (unchanged):** *The Screener is forever free. The intelligence is what you pay for.*

"Intelligence" = depth of understanding, not a model badge.

---

## Reddit test

Before any user-facing copy ships:

1. Remove the word **AI** unless quoting a competitor or internal doc
2. Would r/DynastyFF share this **for the data**, not despite AI cringe?
3. Lead with **specific fantasy insight** (usage, contract, coach tendency) not capability claims
4. Characters feel like **staff with opinions**, not chatbots with prompts

**Distribution:** Reddit is the only channel that matters right now. Every feature should be bot-screenshot- or fact-reply-worthy. See `docs/v2/REDDIT.md`.

---

## Situation Room framing

The Room is a **film room**, not an AI chat product.

- ✅ "Six specialists on the floor. Razzle delivers the verdict."
- ✅ "Your league is already in context — just ask."
- ❌ "AI agents answer your questions"
- ❌ "Powered by advanced language models"

Internal code can say `agents`, `/api/agents`, `AgentId`. **Users never see "AI".**

---

## Intel snippets

Market **facts**, not generation:

- ✅ "IND runs to RBs on 41% of carries — 3rd in the league."
- ✅ "4-year, $120M extension — market just repriced him."
- ❌ "Our AI analyzed his situation and thinks…"

---

## Pro tier

Pay for **depth of understanding**, not tokens:

- Bureau behavioral profiles, not "AI league analysis"
- Situation Room briefings, not "AI chat"
- 100 Lab panels, not "AI-powered tools"

---

## Loop enforcement

**Opus brand audit (every cycle):** grep user-facing strings for `\bAI\b`, `powered by`, `chatbot`, `LLM`. FAIL if found in `apps/web/` copy without explicit exception.

See also: `docs/DESIGN.md`, `docs/BRAND_VOICE_REVIEW.md`, `docs/plans/2026-03-20-agent-connective-tissue-design.md` (Layer 1: users don't realize these are AI — they feel personality).
