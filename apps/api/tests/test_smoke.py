"""Smoke tests — the new app boots and routers are mounted."""

from __future__ import annotations


def test_health(app_client):
    r = app_client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["version"].startswith("2.")


def test_openapi_lists_all_router_prefixes(app_client):
    r = app_client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json()["paths"].keys()
    assert any(p.startswith("/api/screener") for p in paths), "explore router missing"
    assert any(p.startswith("/api/panels") for p in paths), "panels router missing"
    assert any(p.startswith("/api/context") for p in paths), "context router missing"
    assert any(p.startswith("/api/dynasty-rankings") for p in paths), "panel legacy paths missing"
    assert any(p.startswith("/api/weekly-heatmap") for p in paths), "panel legacy paths missing"
    assert any(p.startswith("/api/bureau") for p in paths), "bureau router missing"
    assert any(p.startswith("/api/agents") for p in paths), "agents router missing"
    assert any(p.startswith("/api/auth") for p in paths), "auth router missing"
    assert any(p.startswith("/api/billing") for p in paths), "billing router missing"


def test_quota_endpoint(app_client):
    r = app_client.get("/api/agents/quota")
    assert r.status_code == 200
    body = r.json()
    assert "plan" in body
    assert "limit" in body
