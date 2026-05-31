"""Bureau H2H rivalry URL query contract — mirrors apps/web/lib/bureau-h2h-rivalry-url.ts."""

from __future__ import annotations

from urllib.parse import parse_qs, urlencode


def merge_bureau_h2h_rivalry_search_params(
    existing: str,
    *,
    user_id: str,
    opponent_id: str | None = None,
) -> str:
    from urllib.parse import parse_qsl

    params: dict[str, str] = dict(parse_qsl(existing, keep_blank_values=True))
    params["user"] = user_id
    if opponent_id:
        params["opponent"] = opponent_id
    else:
        params.pop("opponent", None)
    return urlencode(params)


def test_pick_opponent_preserves_user_from_shared_link() -> None:
    query = merge_bureau_h2h_rivalry_search_params(
        "user=u1&opponent=u2",
        user_id="u1",
        opponent_id="u3",
    )
    parsed = parse_qs(query)
    assert parsed["user"] == ["u1"]
    assert parsed["opponent"] == ["u3"]


def test_pick_opponent_sets_user_when_only_opponent_in_url() -> None:
    query = merge_bureau_h2h_rivalry_search_params(
        "opponent=u2",
        user_id="u1",
        opponent_id="u2",
    )
    parsed = parse_qs(query)
    assert parsed["user"] == ["u1"]
    assert parsed["opponent"] == ["u2"]
