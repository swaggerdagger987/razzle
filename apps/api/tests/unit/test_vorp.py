from razzle_api.domain.scoring.config import LeagueConfig, RosterConfig
from razzle_api.domain.scoring.engine import PlayerWeekStats
from razzle_api.domain.valuation.vorp import ProjectionRow, value_players


def test_value_players_computes_vorp_against_position_replacement() -> None:
    config = LeagueConfig(league_size=2, roster=RosterConfig(qb=1, rb=1, wr=0, te=0, flex=0))
    players = [
        ProjectionRow(
            player_id="qb1",
            name="QB One",
            position="QB",
            stats=PlayerWeekStats(pass_yd=300, pass_td=2),
        ),
        ProjectionRow(
            player_id="qb2",
            name="QB Two",
            position="QB",
            stats=PlayerWeekStats(pass_yd=200, pass_td=1),
        ),
        ProjectionRow(
            player_id="qb3",
            name="QB Three",
            position="QB",
            stats=PlayerWeekStats(pass_yd=100, pass_td=1),
        ),
        ProjectionRow(
            player_id="rb1",
            name="RB One",
            position="RB",
            stats=PlayerWeekStats(rush_yd=100, rush_td=1),
        ),
        ProjectionRow(
            player_id="rb2",
            name="RB Two",
            position="RB",
            stats=PlayerWeekStats(rush_yd=40),
        ),
    ]

    valued = value_players(players, config)
    by_id = {player.player_id: player for player in valued}

    assert by_id["qb1"].projected_points == 20.0
    assert by_id["qb1"].replacement_points == 12.0
    assert by_id["qb1"].vorp == 8.0
    assert by_id["rb1"].replacement_points == 4.0
    assert by_id["rb1"].vorp == 12.0
