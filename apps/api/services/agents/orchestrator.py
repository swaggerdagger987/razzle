"""Razzle as orchestrator.

Per docs/NORTH_STAR.md and Phase 6 of the redesign plan:

1. Razzle (router pass) — given the question + context, picks 1-2 specialists.
2. Specialists run in PARALLEL.
3. Razzle (synthesizer pass) — receives specialist outputs, returns one
   prioritized briefing with an urgency tier.

Two LLM calls. Much sharper product than V1's "ask everyone, dump replies."
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

from .context import build_context_block
from .llm import chat
from .personas import LAUNCH_AGENTS
from .personas import load as load_persona
from .registry import ROUTE_DESCRIPTIONS, suggest_specialists
from .triggers import detect_followups

logger = logging.getLogger("razzle.agents.orchestrator")


_URGENCY_PATTERN = re.compile(r"\b(URGENT|MONITOR|OPPORTUNITY|ROUTINE)\b", re.IGNORECASE)


async def orchestrate(
    question: str,
    specialists: list[str],
    league_id: str | None,
    league_format: str,
    *,
    user_id: str | None = None,
    player_id: str | None = None,
    referrer_panel: str | None = None,
) -> dict[str, Any]:
    context_block = build_context_block(
        league_id,
        league_format,
        player_id=player_id,
        user_id=user_id,
        referrer_panel=referrer_panel,
    )

    # 1. Routing — Razzle picks specialists if the user didn't force any.
    chosen = list(specialists) if specialists else await _route(question, context_block)
    chosen = [c for c in chosen if c in LAUNCH_AGENTS and c != "razzle"][:2]
    if not chosen:
        chosen = suggest_specialists(question)[:2]

    # 2. Parallel specialist calls.
    specialist_outputs = await asyncio.gather(
        *(_call_specialist(agent_id, question, context_block) for agent_id in chosen),
        return_exceptions=True,
    )
    outputs = []
    for agent_id, out in zip(chosen, specialist_outputs, strict=True):
        if isinstance(out, Exception):
            logger.warning("specialist %s failed: %s", agent_id, out)
            outputs.append({"agent": agent_id, "text": "", "error": str(out)})
        else:
            outputs.append({"agent": agent_id, **out})

    # 2b. Cross-agent triggers — e.g. Dolphin injury → Hawkeye replacement scan.
    cross_triggers: list[dict[str, str]] = []
    followups = detect_followups(outputs, set(chosen))
    for fu in followups[:1]:
        try:
            out = await _call_specialist(fu["agent"], fu["question"], context_block)
            outputs.append({"agent": fu["agent"], **out, "triggered": True})
            chosen.append(fu["agent"])
            cross_triggers.append({"agent": fu["agent"], "label": fu["label"]})
        except Exception as e:  # noqa: BLE001
            logger.warning("follow-up %s failed: %s", fu["agent"], e)

    # 3. Synthesis — Razzle reads the specialist outputs and produces one briefing.
    briefing, urgency, cost = await _synthesize(question, context_block, outputs, league_format)

    return {
        "briefing": briefing,
        "urgency": urgency,
        "specialists_used": chosen,
        "cross_triggers": cross_triggers,
        "cost_usd": cost,
    }


async def _route(question: str, context_block: str) -> list[str]:
    keyword_pick = suggest_specialists(question)
    if keyword_pick != ["octo"]:
        return keyword_pick

    razzle = load_persona("razzle")
    options = ", ".join(f"{k} ({v})" for k, v in ROUTE_DESCRIPTIONS.items())
    prompt = (
        f"{context_block}\n\n"
        f"## GM question\n{question}\n\n"
        "## Task\n"
        "You are routing this question to specialists. Choose 1 or 2 from this list, "
        f"based on which would add the most value. Reply with ONLY a comma-separated "
        f"list of IDs from: {options}. "
        "Injury or health questions MUST include dolphin. "
        "Reply with just the IDs, no other text."
    )
    res = await chat(razzle, prompt, temperature=0.1, max_tokens=40)
    text = (res.get("text") or "").strip().lower()
    ids = [t.strip() for t in text.replace("\n", ",").split(",") if t.strip()]
    return [i for i in ids if i in LAUNCH_AGENTS]


async def _call_specialist(agent_id: str, question: str, context_block: str) -> dict[str, Any]:
    persona = load_persona(agent_id)
    prompt = (
        f"{context_block}\n\n"
        f"## GM question\n{question}\n\n"
        "## Task\n"
        f"As the {agent_id} specialist, give your read in <=180 words. "
        "End with one line: ‘RECOMMENDATION:’ followed by the call."
    )
    res = await chat(persona, prompt, temperature=0.4, max_tokens=350)
    return {"text": res.get("text", ""), "usage": res.get("usage", {})}


async def _synthesize(
    question: str,
    context_block: str,
    specialist_outputs: list[dict[str, Any]],
    league_format: str,
) -> tuple[str, str, float]:
    razzle = load_persona("razzle")
    specialist_block = "\n\n".join(
        f"### {o['agent'].upper()} reports\n{o.get('text') or '(no output)'}" for o in specialist_outputs
    )
    prompt = (
        f"{context_block}\n\n"
        f"## GM question\n{question}\n\n"
        f"## Specialist reports\n{specialist_block}\n\n"
        "## Task\n"
        f"You are Razzle. Synthesize the above into one briefing for a {league_format} GM. "
        "Lead with the verdict. Reference the specialists by name. End the briefing with a "
        "single line: 'URGENCY: URGENT|MONITOR|OPPORTUNITY|ROUTINE'."
    )
    res = await chat(razzle, prompt, temperature=0.35, max_tokens=700)
    text = res.get("text", "")
    urgency_match = _URGENCY_PATTERN.search(text)
    urgency = urgency_match.group(1).upper() if urgency_match else "ROUTINE"
    # Strip the trailing URGENCY line from the visible briefing.
    cleaned = _URGENCY_PATTERN.sub("", text).strip().rstrip(":").rstrip()
    cost = _estimate_cost([res] + [o for o in specialist_outputs if "usage" in o])
    return cleaned or text, urgency, cost


def _estimate_cost(responses: list[dict[str, Any]]) -> float:
    """Rough $/1M token estimate for openrouter haiku tier. Phase 6.5 reads
    the actual cost field that OpenRouter returns."""
    total_tokens = 0
    for r in responses:
        u = r.get("usage") or {}
        total_tokens += int(u.get("total_tokens") or 0)
    return round(total_tokens / 1_000_000 * 0.80, 5)
