"""Bureau router — Sleeper-connected league intelligence."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter

from ..models.bureau import H2HRef, LeagueRef, PlayerLeagueRef
from ..services import bureau

router = APIRouter(prefix="/api/bureau", tags=["bureau"])


@router.post("/self-scout")
def self_scout(ref: LeagueRef) -> dict:
    return bureau.self_scout(league_id=ref.league_id, user_id=ref.user_id)


@router.post("/roster-depth")
def roster_depth(ref: LeagueRef) -> dict:
    return bureau.roster_depth(league_id=ref.league_id, user_id=ref.user_id)


@router.post("/build-profiles")
def build_profiles(ref: LeagueRef) -> dict:
    return bureau.build_profiles(league_id=ref.league_id)


@router.post("/power-rankings")
def power_rankings(ref: LeagueRef) -> dict:
    return bureau.power_rankings(league_id=ref.league_id)


@router.post("/trade-network")
def trade_network(ref: LeagueRef) -> dict:
    return bureau.trade_network(league_id=ref.league_id)


@router.post("/waiver-tendencies")
def waiver_tendencies(ref: LeagueRef) -> dict:
    return bureau.waiver_tendencies(league_id=ref.league_id)


@router.post("/head-to-head")
def head_to_head(ref: H2HRef) -> dict:
    return bureau.head_to_head(
        league_id=ref.league_id,
        user_id=ref.user_id,
        opponent_user_id=ref.opponent_user_id,
    )


@router.post("/strength-of-schedule")
def strength_of_schedule(ref: LeagueRef) -> dict:
    return bureau.strength_of_schedule(league_id=ref.league_id, user_id=ref.user_id)


@router.post("/monte-carlo")
def monte_carlo(ref: LeagueRef, scoring: Literal["ppr", "half_ppr", "std"] = "half_ppr") -> dict:
    return bureau.monte_carlo_projections(league_id=ref.league_id, scoring=scoring)


@router.post("/player-status")
def player_status(ref: PlayerLeagueRef) -> dict:
    return bureau.player_league_status(
        league_id=ref.league_id,
        user_id=ref.user_id,
        player_id=ref.player_id,
    )


@router.post("/manager-profiles")
def manager_profiles(ref: LeagueRef) -> dict:
    return bureau.manager_profiles(league_id=ref.league_id)


@router.post("/pressure-map")
def pressure_map(ref: LeagueRef) -> dict:
    return bureau.pressure_map(league_id=ref.league_id)
