"""Agent orchestrator unit tests.

These don't hit the LLM (key isn't required for the unit-level routing
helper). The real end-to-end call is integration-tested with a fixture
key in CI later.
"""

from __future__ import annotations


def test_personas_load():
    from apps.api.services.agents.personas import load, LAUNCH_AGENTS

    for agent_id in LAUNCH_AGENTS:
        text = load(agent_id)
        assert text, f"persona for {agent_id} is empty"
        assert len(text) > 100, f"persona for {agent_id} looks truncated"


def test_orchestrate_returns_shape_without_key(app_client, monkeypatch):
    """With no LLM key set, the orchestrator returns a structured no-op."""
    import os
    monkeypatch.delenv("RAZZLE_LLM_API_KEY", raising=False)
    # Clear cached settings so the env change takes effect
    from apps.api.config import get_settings
    get_settings.cache_clear()

    r = app_client.post(
        "/api/agents/ask",
        json={"question": "Should I trade Bijan for Chase?", "format": "dynasty"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "briefing" in body
    assert body["urgency"] in {"URGENT", "MONITOR", "OPPORTUNITY", "ROUTINE"}
    assert isinstance(body["specialists_used"], list)
