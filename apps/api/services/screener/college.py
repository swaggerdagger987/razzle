"""College screener — normalize legacy fetch_college_players for Explore API."""

from __future__ import annotations

from ...models.screener import ScreenerQuery

_FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}
_POSITION_MAP = {
    "QB": "QB",
    "RB": "RB",
    "WR": "WR",
    "TE": "TE",
    "FB": "RB",
    "ATH": "WR",
}


def _map_position(raw: str | None) -> str | None:
    pos = (raw or "").strip().upper()
    mapped = _POSITION_MAP.get(pos)
    if mapped in _FANTASY_POSITIONS:
        return mapped
    return None


def _normalize_college_row(row: dict) -> dict | None:
    position = _map_position(row.get("position"))
    if not position:
        return None
    name = row.get("player_name") or row.get("full_name") or ""
    if not name:
        return None
    normalized = {
        "player_id": str(row.get("player_id") or ""),
        "full_name": name,
        "position": position,
        "team": row.get("team") or "",
        "age": None,
        "games": int(row.get("games") or 0),
        "fantasy_points_ppr": 0.0,
    }
    for key, val in row.items():
        if key in normalized or key == "player_name":
            continue
        normalized[key] = val
    return normalized


def run_college_screener(query: ScreenerQuery, live_data) -> dict:
    positions = ",".join(query.positions) if query.positions else ""
    team = query.teams[0] if query.teams else ""
    season = query.season if isinstance(query.season, int) else 0
    sort_key = query.sort_key
    if sort_key in ("fantasy_points_ppr", "full_name"):
        sort_key = "total_yards" if sort_key == "fantasy_points_ppr" else "player_name"

    raw = live_data.fetch_college_players(
        search=query.search,
        positions=positions,
        team=team,
        sort_key=sort_key,
        sort_dir=query.sort_direction,
        limit=query.limit,
        offset=query.offset,
        season=season,
    )

    items = []
    for row in raw.get("items", []):
        normalized = _normalize_college_row(row)
        if normalized and normalized["player_id"]:
            items.append(normalized)

    return {
        "items": items,
        "count": raw.get("count", len(items)),
        "season": raw.get("season", season or 0),
        "universe": "college",
    }
