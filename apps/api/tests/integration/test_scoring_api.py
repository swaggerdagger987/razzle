from httpx import ASGITransport, AsyncClient

from razzle_api.main import app


async def test_scoring_preview_scores_default_ppr() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/scoring/preview",
            json={
                "position": "RB",
                "stats": {
                    "pass_yd": 250,
                    "pass_td": 2,
                    "rush_yd": 20,
                    "rec": 5,
                    "rec_yd": 40,
                },
            },
        )

    assert response.status_code == 200
    assert response.json() == {"points": 29.0}
