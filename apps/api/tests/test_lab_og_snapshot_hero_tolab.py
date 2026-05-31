"""Lab OG snapshot exports — hero player on Breakouts export link (Lab L5)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_breakouts_export_passes_hero_player_and_name():
    renderer = (
        _repo_root() / "apps/web/components/lab/renderers/BreakoutsRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "playerId={top?.player_id}" in renderer
    assert "playerName={top?.name}" in renderer


def test_lab_export_encodes_snapshot_pid_when_player_set():
    link = (_repo_root() / "apps/web/components/lab/LabOgExportLink.tsx").read_text(
        encoding="utf-8",
    )
    assert "encodeOgSnapshot(snapshotRows, resolvedPlayerId)" in link
