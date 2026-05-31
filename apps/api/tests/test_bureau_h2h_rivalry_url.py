"""Source contracts for Bureau H2H rivalry deep-links."""

from __future__ import annotations

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_h2h_pick_opponent_preserves_user_param():
    src = (_repo_root() / "apps/web/components/league/BureauHeadToHead.tsx").read_text(
        encoding="utf-8"
    )
    assert 'params.set("user", rivalryUserId)' in src
    assert "rivalryUserId" in src


def test_league_dashboard_h2h_honors_url_user():
    src = (_repo_root() / "apps/web/components/league/LeagueDashboard.tsx").read_text(
        encoding="utf-8"
    )
    assert 'searchParams.get("user")' in src
    assert "urlUser" in src
    assert "body.user_id = urlUser" in src
