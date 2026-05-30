"""Panel catalog smoke tests."""

from __future__ import annotations

import pytest

FREE_PANELS = ["weekly", "prospects", "dashboard", "leaders", "screener"]


def test_panels_list_count(app_client):
    r = app_client.get("/api/panels")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 100
    assert len(body["panels"]) == 100
    slugs = {p["slug"] for p in body["panels"]}
    assert "screener" in slugs
    assert "weekly" in slugs


def test_panel_slug_not_found(app_client):
    r = app_client.get("/api/panels/does-not-exist")
    assert r.status_code == 404


def test_registry_handlers_resolve():
    from apps.api.legacy_bridge import live_data
    from apps.api.services.panels.registry import list_panels

    ld = live_data()
    handlers = {p["api"]["handler"] for p in list_panels()}
    missing = [h for h in handlers if not hasattr(ld, h)]
    assert not missing, f"missing live_data handlers: {missing}"


@pytest.mark.parametrize("slug", FREE_PANELS)
def test_free_panels_never_500(app_client, slug):
    r = app_client.get(f"/api/panels/{slug}")
    assert r.status_code != 500


def test_pro_panel_returns_402_on_free_plan(app_client):
    r = app_client.get("/api/panels/rankings")
    assert r.status_code == 402
    body = r.json()
    assert body["detail"]["error"] == "upgrade_required"
