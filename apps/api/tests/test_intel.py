"""Intel snippet tests."""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[3]
DB = REPO / "data" / "terminal.db"


@pytest.mark.skipif(not DB.exists(), reason="terminal.db missing")
def test_intel_sync_and_snippets():
    from apps.api.services.intel.sync import sync_intel
    from apps.api.services.intel.snippets import intel_for_player

    stats = sync_intel(DB)
    assert stats["contracts"] > 1000
    assert stats["team_tendencies"] >= 20

    conn = sqlite3.connect(DB)
    row = conn.execute(
        "SELECT player_id FROM players WHERE position = 'RB' AND team IS NOT NULL LIMIT 1"
    ).fetchone()
    conn.close()
    assert row

    snippets = intel_for_player(row[0])
    assert isinstance(snippets, list)
