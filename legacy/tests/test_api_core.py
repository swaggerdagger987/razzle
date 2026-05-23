"""Smoke tests for core API endpoints."""


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_players(client):
    resp = client.get("/api/players")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "count" in data
    assert isinstance(data["items"], list)


def test_filter_options(client):
    resp = client.get("/api/filter-options")
    assert resp.status_code == 200
    data = resp.json()
    assert "positions" in data
    assert "teams" in data
    assert "seasons" in data


def test_players_with_position_filter(client):
    resp = client.get("/api/players?position=QB")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data["items"], list)


def test_quick_search(client):
    resp = client.get("/api/players/quick-search?q=mahomes")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_heatmap(client):
    resp = client.get("/api/heatmap")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, (list, dict))
