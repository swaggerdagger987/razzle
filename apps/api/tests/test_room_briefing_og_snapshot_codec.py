"""Contract tests for Room briefing OG snapshot compact codec (q/u/b/s).

Mirrors apps/web/lib/room-briefing-og-snapshot.ts so BriefingShareBar encode and
OG decode stay aligned in CI without a separate web test runner.
"""

from __future__ import annotations

import base64
import json
from typing import Any

URGENCY_VALUES = frozenset({"URGENT", "MONITOR", "OPPORTUNITY", "ROUTINE"})


def _truncate(text: str, max_len: int) -> str:
    t = text.strip()
    if len(t) <= max_len:
        return t
    return f"{t[: max_len - 1]}…"


def _b64url_encode(compact: dict[str, Any]) -> str:
    raw = json.dumps(compact, separators=(",", ":"))
    b64 = base64.b64encode(raw.encode("utf-8")).decode("ascii")
    return b64.replace("+", "-").replace("/", "_").rstrip("=")


def _b64url_decode(param: str) -> dict[str, Any]:
    b64 = param.replace("-", "+").replace("_", "/")
    pad = "=" * ((4 - len(b64) % 4) % 4)
    return json.loads(base64.b64decode(b64 + pad))


def encode_room_briefing_snapshot(
    *,
    question: str,
    urgency: str,
    briefing: str,
    specialists: list[str] | None = None,
) -> str | None:
    q = question.strip()
    b = briefing.strip()
    if not q or not b:
        return None
    compact: dict[str, Any] = {
        "q": _truncate(question, 200),
        "u": urgency if urgency in URGENCY_VALUES else "ROUTINE",
        "b": _truncate(briefing, 480),
        "s": (specialists or [])[:6],
    }
    return _b64url_encode(compact)


def decode_room_briefing_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    q = compact.get("q")
    b = compact.get("b")
    if not isinstance(q, str) or not q.strip():
        return None
    if not isinstance(b, str) or not b.strip():
        return None
    u = compact.get("u")
    urgency = u if isinstance(u, str) and u in URGENCY_VALUES else "ROUTINE"
    s = compact.get("s")
    specialists = [x for x in s if x] if isinstance(s, list) else []
    return {
        "question": q,
        "urgency": urgency,
        "briefing": b,
        "specialists": specialists,
    }


# Matches DEMO_BRIEFING on apps/web/app/og/briefing/route.tsx
DEMO_SNAPSHOT_PARAM = encode_room_briefing_snapshot(
    question="Should I sell high on my RB1 before the deadline?",
    urgency="MONITOR",
    briefing=(
        "Hold unless you land a top-12 WR. Your RB room covers six weeks — "
        "selling now trades a playoff ceiling for a marginal QB upgrade."
    ),
    specialists=["hawkeye", "bones", "razzle"],
)


def test_snapshot_roundtrip_matches_panel_shape():
    param = encode_room_briefing_snapshot(
        question="Trade my WR2 for a 2027 1st?",
        urgency="URGENT",
        briefing="Only if the pick projects top-3. Your window is win-now — aging RBs need WR depth.",
        specialists=["bones", "hawkeye"],
    )
    assert param is not None
    decoded = decode_room_briefing_snapshot(param)
    assert decoded is not None
    assert decoded["question"] == "Trade my WR2 for a 2027 1st?"
    assert decoded["urgency"] == "URGENT"
    assert decoded["specialists"] == ["bones", "hawkeye"]


def test_demo_fixture_param_decodes_for_og_export():
    assert DEMO_SNAPSHOT_PARAM is not None
    decoded = decode_room_briefing_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["urgency"] == "MONITOR"
    assert "hawkeye" in decoded["specialists"]
    assert "RB1" in decoded["question"]


def test_invalid_urgency_defaults_to_routine():
    legacy = {
        "q": "Quick question?",
        "u": "UNKNOWN",
        "b": "Staff says wait on the trade.",
        "s": [],
    }
    decoded = decode_room_briefing_snapshot(_b64url_encode(legacy))
    assert decoded is not None
    assert decoded["urgency"] == "ROUTINE"


def test_malformed_snapshot_returns_none():
    assert decode_room_briefing_snapshot("not-valid-base64!!!") is None
    assert decode_room_briefing_snapshot(_b64url_encode({"q": "", "b": "x", "u": "ROUTINE", "s": []})) is None
    assert encode_room_briefing_snapshot(question="", urgency="ROUTINE", briefing="text") is None
