"""League context store tests."""

from __future__ import annotations

from unittest.mock import patch

from apps.api.services.context.loader import LeagueContext, Roster, User
from apps.api.services.context.store import get_cached, get_or_refresh, save_snapshot


def _sample_ctx(league_id: str = "test-league") -> LeagueContext:
    return LeagueContext(
        league_id=league_id,
        name="Test League",
        season=2024,
        sport="nfl",
        total_rosters=10,
        roster_positions=["QB", "RB", "WR", "TE", "FLEX"],
        scoring_settings={},
        settings={},
        rosters=[
            Roster(roster_id=1, owner_id="u1", players=["p1"], starters=["p1"], wins=5, losses=3),
        ],
        users=[User(user_id="u1", display_name="GM1")],
        transactions=[],
    )


def test_store_ttl_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    db_file = tmp_path / "api_cache.db"
    monkeypatch.setattr(
        "apps.api.services.context.store._cache_db_path",
        lambda: db_file,
    )

    ctx = _sample_ctx()
    save_snapshot(ctx, ttl=300)
    cached = get_cached("test-league")
    assert cached is not None
    assert cached.name == "Test League"


def test_get_or_refresh_uses_cache(tmp_path, monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    db_file = tmp_path / "api_cache.db"
    monkeypatch.setattr(
        "apps.api.services.context.store._cache_db_path",
        lambda: db_file,
    )

    ctx = _sample_ctx("cached-league")
    save_snapshot(ctx, ttl=300)

    with patch("apps.api.services.context.store.fetch_league") as fetch:
        result = get_or_refresh("cached-league")
        fetch.assert_not_called()
    assert result is not None
    assert result.league_id == "cached-league"
