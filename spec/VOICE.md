# Voice — Obsessed With Fantasy, Not AI

**People hate AI wrappers. We do not market AI.** We market obsession with fantasy football — the tape, the numbers, the league context, the manager psychology. LLMs are implementation. Users get **staff who already know their league**.

## What we sell

| Yes | No |
|-----|-----|
| Research lab | AI platform |
| Film room / war room | Chatbot |
| Intelligence, context, intel | Artificial intelligence |
| Staff (Razzle, Dr. Dolphin, Hawkeye…) | AI agents |
| Obsessed with the game | Powered by AI |
| "Already knows your league" | "Ask our AI anything" |

**Brand line:** *The Screener is forever free. The intelligence is what you pay for.* "Intelligence" = depth of understanding, not a model badge.

## The Reddit test (every user-facing string)

1. Remove the word **AI** unless quoting a competitor.
2. Would r/DynastyFF share this **for the data**, not despite AI cringe?
3. Lead with specific fantasy insight (usage, contract, coach tendency), not capability claims.
4. Characters feel like **staff with opinions**, not chatbots with prompts.

## Situation Room framing

A film room, not an AI chat product.

- ✅ "Six specialists on the floor. Razzle delivers the verdict."
- ✅ "Your league is already in context — just ask."
- ❌ "AI agents answer your questions"
- ❌ "Powered by advanced language models"

Internal code may say `agents`, `/api/agents`, `AgentId`. **Users never see "AI".**

## Intel framing

Market facts, not generation:

- ✅ "IND runs to RBs on 41% of carries — 3rd in the league."
- ✅ "4-year, $120M extension — market just repriced him."
- ❌ "Our AI analyzed his situation and thinks…"

## Pro tier framing

Pay for depth of understanding, not tokens: Bureau behavioral profiles, not "AI league analysis" · Situation Room briefings, not "AI chat" · Lab panels, not "AI-powered tools".

## Loading vocabulary

*"pulling film..."* · *"checking the tape..."* · *"running the numbers..."* — never "Loading..." or a bare spinner.

## Win / loss posture

On a win, users say it: "Razzle called it." We don't celebrate ourselves. On a loss: "Put our best effort in. Ball up top." No excuses, no "technically the model was right."

## Enforcement (factory gate)

Every slice touching `apps/web`: grep user-facing strings for `\bAI\b`, `powered by`, `chatbot`, `LLM`. Found without an explicit exception = G5 FAIL.
