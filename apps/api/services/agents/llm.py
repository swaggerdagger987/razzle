"""LLM client — wraps OpenRouter (the Elite-included default).

One async client per request. Uses the OpenAI Python SDK with OpenRouter's
OpenAI-compatible endpoint so the same code talks to any provider the user
configures via BYOK (advanced toggle).
"""

from __future__ import annotations

import logging
from typing import Any

from openai import AsyncOpenAI

from ...config import get_settings

logger = logging.getLogger("razzle.agents.llm")


async def chat(
    system: str,
    user: str,
    *,
    model: str | None = None,
    api_key: str | None = None,
    temperature: float = 0.4,
    max_tokens: int = 800,
) -> dict[str, Any]:
    """Single chat completion. Returns {text, usage}."""
    settings = get_settings()
    key = api_key or settings.llm_api_key
    if not key:
        return {"text": "", "usage": {}, "error": "no LLM API key configured"}

    client = AsyncOpenAI(api_key=key, base_url=settings.llm_base_url)
    try:
        resp = await client.chat.completions.create(
            model=model or settings.llm_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        choice = resp.choices[0] if resp.choices else None
        text = (choice.message.content if choice else "") or ""
        usage = dict(resp.usage) if resp.usage else {}
        return {"text": text.strip(), "usage": usage}
    except Exception as e:  # noqa: BLE001
        logger.exception("LLM call failed")
        return {"text": "", "usage": {}, "error": str(e)}
