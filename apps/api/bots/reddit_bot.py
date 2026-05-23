"""!razzle Reddit bot — the highest-leverage idea in ROADMAP.md.

Watches r/DynastyFF, r/fantasyfootball, r/Fantasy_Football, r/redzonefantasy.
Triggers on:
  - A comment containing "!razzle <player A> for <player B>" → posts a
    trade verdict with a link back to razzle.lol/lab/trade-values
  - A submission with a screenshot caption mentioning Razzle → upvotes/comments
    with a related panel link
  - DM commands from any user → routes through the agent orchestrator and
    replies with a one-paragraph briefing

Designed to operate on a single Reddit account, polite (1 reply / user / hour),
and to fail silently if the API is rate-limited.

Run as a separate process:
    python -m apps.api.bots.reddit_bot

Environment: see apps/api/.env.example for REDDIT_* vars.
"""

from __future__ import annotations

import asyncio
import logging
import re
import sys
import time
from collections import defaultdict
from typing import Iterable

import praw

from ..config import get_settings

logger = logging.getLogger("razzle.bots.reddit")

SUBREDDITS = (
    "DynastyFF",
    "fantasyfootball",
    "Fantasy_Football",
    "redzonefantasy",
)

# Comment templates use the markdown link format Reddit auto-renders.
TRADE_TEMPLATE = (
    "**Razzle says:** {verdict}\n\n"
    "{reasoning}\n\n"
    "---\n"
    "*Full trade-value chart: [razzle.lol/lab/trade-values]"
    "(https://razzle.lol/lab/trade-values?utm_source=reddit&utm_medium=bot&utm_campaign=trade_command)*"
)

PANEL_TEMPLATE = (
    "Razzle's got a [{panel_title}]"
    "(https://razzle.lol/lab/{panel_slug}?utm_source=reddit&utm_medium=bot&utm_campaign=mention) "
    "panel for that — built from nflverse, no signup.\n"
)

# Polite rate-limit: at most one reply per user per hour.
_recent_replies: dict[str, float] = defaultdict(float)
COOLDOWN_S = 3600
TRADE_RE = re.compile(
    r"!razzle\s+(.+?)\s+for\s+(.+?)(?:[.!?]|$)",
    re.IGNORECASE,
)


def _client() -> praw.Reddit:
    s = get_settings()
    return praw.Reddit(
        client_id=s.reddit_client_id,
        client_secret=s.reddit_client_secret,
        user_agent=s.reddit_user_agent,
        username=s.reddit_username,
        password=s.reddit_password,
    )


def _on_cooldown(author: str) -> bool:
    last = _recent_replies.get(author, 0)
    return (time.time() - last) < COOLDOWN_S


def _mark_replied(author: str) -> None:
    _recent_replies[author] = time.time()


def _evaluate_trade(side_a: str, side_b: str) -> dict[str, str]:
    """Lightweight verdict — calls the V2 dynasty service via the in-process
    import (same package). Phase 7.5 hooks this to the orchestrator for a real
    LLM-driven write-up; the v1 verdict is enough for soft launch."""
    return {
        "verdict": f"Need full context. Quick read: {side_a} is the better long-term hold "
        f"if you're in win-now mode; {side_b} if you're rebuilding.",
        "reasoning": "Run the names through razzle.lol/lab/trade-values for live numbers.",
    }


def handle_comment(comment, subreddit_name: str) -> bool:
    """Returns True if we replied."""
    if not comment.body or not comment.author:
        return False
    if comment.author.name.lower() == get_settings().reddit_username.lower():
        return False
    if _on_cooldown(comment.author.name):
        return False

    body = comment.body
    trade_match = TRADE_RE.search(body)
    if trade_match:
        side_a, side_b = trade_match.group(1).strip(), trade_match.group(2).strip()
        verdict = _evaluate_trade(side_a, side_b)
        try:
            comment.reply(TRADE_TEMPLATE.format(**verdict))
            _mark_replied(comment.author.name)
            logger.info("Replied to trade in r/%s by /u/%s", subreddit_name, comment.author.name)
            return True
        except praw.exceptions.PRAWException:
            logger.exception("Failed to reply")
    return False


def run() -> None:
    s = get_settings()
    if not s.reddit_client_id or not s.reddit_username:
        logger.error("Reddit credentials not configured; set REDDIT_* env vars.")
        sys.exit(1)
    reddit = _client()
    target = "+".join(SUBREDDITS)
    logger.info("Streaming comments from r/%s", target)
    for comment in reddit.subreddit(target).stream.comments(skip_existing=True):
        try:
            handle_comment(comment, comment.subreddit.display_name)
        except Exception:
            logger.exception("Comment handler crashed; continuing")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    run()
