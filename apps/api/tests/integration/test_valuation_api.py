from httpx import ASGITransport, AsyncClient

from razzle_api.main import app


async def test_vorp_preview_returns_players_sorted_by_vorp() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/valuation/vorp/preview",
            json={
                "config": {
                    "league_size": 2,
                    "roster": {"qb": 1, "rb": 1, "wr": 0, "te": 0, "flex": 0},
                },
                "players": [
                    {
                        "player_id": "rb1",
                        "name": "RB One",
                        "position": "RB",
                        "stats": {"rush_yd": 100, "rush_td": 1},
                    },
                    {
                        "player_id": "rb2",
                        "name": "RB Two",
                        "position": "RB",
                        "stats": {"rush_yd": 40},
                    },
                    {
                        "player_id": "qb1",
                        "name": "QB One",
                        "position": "QB",
                        "stats": {"pass_yd": 300, "pass_td": 2},
                    },
                    {
                        "player_id": "qb2",
                        "name": "QB Two",
                        "position": "QB",
                        "stats": {"pass_yd": 200, "pass_td": 1},
                    },
                ],
            },
        )

    assert response.status_code == 200
    players = response.json()["players"]
    assert players[0]["player_id"] == "rb1"
    assert players[0]["vorp"] == 12.0
