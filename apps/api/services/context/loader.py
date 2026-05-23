"""Fetch league context from the Sleeper API."""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from typing import Any

import httpx

logger = logging.getLogger("razzle.context.loader")

_SLEEPER = "https://api.sleeper.app/v1"


@dataclass
class Roster:
    roster_id: int
    owner_id: str
    players: list[str] = field(default_factory=list)
    starters: list[str] = field(default_factory=list)
    wins: int = 0
    losses: int = 0
    ties: int = 0
    points_for: float = 0.0
    points_against: float = 0.0
    waiver_position: int = 0


@dataclass
class User:
    user_id: str
    display_name: str
    team_name: str | None = None


@dataclass
class LeagueContext:
    league_id: str
    name: str
    season: int
    sport: str
    total_rosters: int
    roster_positions: list[str]
    scoring_settings: dict[str, Any]
    settings: dict[str, Any]
    rosters: list[Roster]
    users: list[User]
    transactions: list[dict[str, Any]] = field(default_factory=list)

    def roster_for_user(self, user_id: str) -> Roster | None:
        return next((r for r in self.rosters if r.owner_id == user_id), None)

    def user_for_roster(self, roster_id: int) -> User | None:
        owner = next((r.owner_id for r in self.rosters if r.roster_id == roster_id), None)
        if not owner:
            return None
        return next((u for u in self.users if u.user_id == owner), None)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> LeagueContext:
        return cls(
            league_id=data["league_id"],
            name=data["name"],
            season=int(data["season"]),
            sport=data.get("sport", "nfl"),
            total_rosters=int(data["total_rosters"]),
            roster_positions=list(data.get("roster_positions") or []),
            scoring_settings=dict(data.get("scoring_settings") or {}),
            settings=dict(data.get("settings") or {}),
            rosters=[Roster(**r) for r in data.get("rosters") or []],
            users=[User(**u) for u in data.get("users") or []],
            transactions=list(data.get("transactions") or []),
        )


def _http(path: str) -> Any:
    try:
        r = httpx.get(f"{_SLEEPER}{path}", timeout=8.0, headers={"User-Agent": "razzle/2.0"})
        if r.status_code == 200:
            return r.json()
    except httpx.HTTPError:
        logger.exception("Sleeper GET %s failed", path)
    return None


def fetch_league(league_id: str) -> LeagueContext | None:
    """Fetch a full LeagueContext from Sleeper (no cache)."""
    league = _http(f"/league/{league_id}")
    if not league:
        return None

    rosters_raw = _http(f"/league/{league_id}/rosters") or []
    users_raw = _http(f"/league/{league_id}/users") or []
    txns_raw: list[dict[str, Any]] = []
    for week in range(1, 19):
        chunk = _http(f"/league/{league_id}/transactions/{week}") or []
        if not chunk:
            continue
        txns_raw.extend(chunk)
        if len(txns_raw) > 500:
            break

    return LeagueContext(
        league_id=league_id,
        name=league.get("name", ""),
        season=int(league.get("season") or 0),
        sport=league.get("sport", "nfl"),
        total_rosters=int(league.get("total_rosters") or 0),
        roster_positions=list(league.get("roster_positions") or []),
        scoring_settings=league.get("scoring_settings") or {},
        settings=league.get("settings") or {},
        rosters=[
            Roster(
                roster_id=int(r.get("roster_id")),
                owner_id=str(r.get("owner_id") or ""),
                players=list(r.get("players") or []),
                starters=list(r.get("starters") or []),
                wins=int((r.get("settings") or {}).get("wins") or 0),
                losses=int((r.get("settings") or {}).get("losses") or 0),
                ties=int((r.get("settings") or {}).get("ties") or 0),
                points_for=float((r.get("settings") or {}).get("fpts") or 0)
                + float((r.get("settings") or {}).get("fpts_decimal") or 0) / 100,
                points_against=float((r.get("settings") or {}).get("fpts_against") or 0)
                + float((r.get("settings") or {}).get("fpts_against_decimal") or 0) / 100,
                waiver_position=int((r.get("settings") or {}).get("waiver_position") or 0),
            )
            for r in rosters_raw
        ],
        users=[
            User(
                user_id=str(u.get("user_id")),
                display_name=u.get("display_name", "anon"),
                team_name=(u.get("metadata") or {}).get("team_name"),
            )
            for u in users_raw
        ],
        transactions=txns_raw,
    )
