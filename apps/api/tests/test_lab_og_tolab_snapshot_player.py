"""Lab OG snapshot exports embed player context for toLab watermark (Lab L5 atom 3/3)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"
EXPORT_TS = ROOT / "apps/web/components/lab/LabOgExportLink.tsx"


def test_encode_og_snapshot_supports_player_context():
    source = EXPORT_TS.read_text(encoding="utf-8")
    assert "OgSnapshotEncodeContext" in source
    assert '"pi": playerId' in source or "pi: playerId" in source
    assert "encodeOgSnapshot(snapshotRows, {" in source


def test_decode_og_snapshot_reads_v1_player_meta():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function decodeOgSnapshot(param: string): OgSnapshotPayload" in source
    assert "v1.pi" in source
    assert "v1.pn" in source
    assert "snapshotPayload.playerId" in source
    assert "watermarkPlayerName" in source


def test_lab_og_watermark_uses_resolved_player_name():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEFAULT_OG_PLAYER_NAME" in source
    assert "playerName: watermarkPlayerName" in source
    assert "slugifyPlayerName(resolvedName)" in source
