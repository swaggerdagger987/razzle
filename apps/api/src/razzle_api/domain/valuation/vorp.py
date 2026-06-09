from collections import defaultdict

from pydantic import BaseModel, ConfigDict

from razzle_api.domain.scoring.config import LeagueConfig, Position
from razzle_api.domain.scoring.engine import PlayerWeekStats, score_week


class ProjectionRow(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player_id: str
    name: str
    position: Position
    stats: PlayerWeekStats


class ValuedPlayer(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player_id: str
    name: str
    position: Position
    projected_points: float
    replacement_points: float
    vorp: float
    rank: int
    position_rank: int


def value_players(players: list[ProjectionRow], config: LeagueConfig) -> list[ValuedPlayer]:
    scored = [
        (
            player,
            score_week(player.stats, config.scoring, player.position),
        )
        for player in players
    ]
    replacement = _replacement_points(scored, config)
    overall_rank = {
        player.player_id: rank
        for rank, (player, _points) in enumerate(
            sorted(scored, key=lambda row: row[1], reverse=True),
            start=1,
        )
    }
    position_rank = _position_ranks(scored)

    valued = [
        ValuedPlayer(
            player_id=player.player_id,
            name=player.name,
            position=player.position,
            projected_points=points,
            replacement_points=replacement.get(player.position, 0.0),
            vorp=round(points - replacement.get(player.position, 0.0), 4),
            rank=overall_rank[player.player_id],
            position_rank=position_rank[player.player_id],
        )
        for player, points in scored
    ]
    return sorted(valued, key=lambda player: player.vorp, reverse=True)


def _replacement_points(
    scored: list[tuple[ProjectionRow, float]],
    config: LeagueConfig,
) -> dict[Position, float]:
    by_position: dict[Position, list[float]] = defaultdict(list)
    for player, points in scored:
        by_position[player.position].append(points)

    for points in by_position.values():
        points.sort(reverse=True)

    slots = _replacement_slots(config)
    return {
        position: _points_at_replacement(by_position[position], slots.get(position, 0))
        for position in by_position
    }


def _replacement_slots(config: LeagueConfig) -> dict[Position, int]:
    roster = config.roster
    league_size = config.league_size
    return {
        "QB": league_size * (roster.qb + roster.superflex),
        "RB": league_size * roster.rb + round(league_size * roster.flex * 0.4),
        "WR": league_size * roster.wr + round(league_size * roster.flex * 0.4),
        "TE": league_size * roster.te + round(league_size * roster.flex * 0.2),
        "K": league_size * roster.k,
        "DST": league_size * roster.dst,
        "IDP": league_size * roster.idp,
    }


def _points_at_replacement(points: list[float], slot_count: int) -> float:
    if not points or slot_count <= 0:
        return 0.0
    index = min(slot_count, len(points)) - 1
    return points[index]


def _position_ranks(scored: list[tuple[ProjectionRow, float]]) -> dict[str, int]:
    by_position: dict[Position, list[tuple[ProjectionRow, float]]] = defaultdict(list)
    for player, points in scored:
        by_position[player.position].append((player, points))

    ranks: dict[str, int] = {}
    for rows in by_position.values():
        for rank, (player, _points) in enumerate(
            sorted(rows, key=lambda row: row[1], reverse=True),
            start=1,
        ):
            ranks[player.player_id] = rank
    return ranks
