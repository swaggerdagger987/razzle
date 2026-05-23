"""Reddit bot unit tests — no Reddit network, just parser + cooldown."""

from __future__ import annotations


def test_trade_regex_matches_basic_command():
    from apps.api.bots.reddit_bot import TRADE_RE

    m = TRADE_RE.search("!razzle Bijan Robinson for Ja'Marr Chase. thoughts?")
    assert m is not None
    assert m.group(1).strip() == "Bijan Robinson"
    assert m.group(2).strip() == "Ja'Marr Chase"


def test_trade_regex_handles_no_terminator():
    from apps.api.bots.reddit_bot import TRADE_RE

    m = TRADE_RE.search("!razzle Saquon for Henry")
    assert m is not None
    assert m.group(1).strip() == "Saquon"
    assert m.group(2).strip() == "Henry"


def test_trade_regex_case_insensitive():
    from apps.api.bots.reddit_bot import TRADE_RE

    m = TRADE_RE.search("!RAZZLE chase For Bijan?")
    assert m is not None


def test_cooldown_blocks_repeat_replies(monkeypatch):
    from apps.api.bots import reddit_bot

    reddit_bot._recent_replies.clear()
    reddit_bot._mark_replied("alice")
    assert reddit_bot._on_cooldown("alice") is True
    # Travel past the cooldown window
    future = reddit_bot._recent_replies["alice"] + reddit_bot.COOLDOWN_S + 60
    monkeypatch.setattr(reddit_bot.time, "time", lambda: future)
    assert reddit_bot._on_cooldown("alice") is False
