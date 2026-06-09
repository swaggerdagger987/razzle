"""players and player_week_stats

Revision ID: 0001
Revises:
Create Date: 2026-06-09

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Core offensive + kicking stat columns, named to mirror
# razzle_api.domain.scoring.engine.PlayerWeekStats so rows can be loaded
# straight into the scoring engine without a mapping layer.
STAT_COLUMNS = [
    "pass_att",
    "pass_cmp",
    "pass_yd",
    "pass_td",
    "pass_int",
    "pass_sack",
    "pass_two_pt",
    "rush_att",
    "rush_yd",
    "rush_td",
    "rush_two_pt",
    "target",
    "rec",
    "rec_yd",
    "rec_td",
    "rec_two_pt",
    "fumble",
    "fumble_lost",
    "return_yd",
    "return_td",
    "special_teams_td",
    "pat_made",
    "pat_missed",
    "fg_made",
    "fg_missed",
]


def upgrade() -> None:
    op.create_table(
        "players",
        sa.Column("gsis_id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("position", sa.String(), nullable=False),
        sa.Column("team", sa.String(), nullable=True),
        sa.Column("sleeper_id", sa.String(), nullable=True),
    )
    op.create_index("ix_players_position", "players", ["position"])

    op.create_table(
        "player_week_stats",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "player_id",
            sa.String(),
            sa.ForeignKey("players.gsis_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("season", sa.Integer(), nullable=False),
        sa.Column("week", sa.Integer(), nullable=False),
        *[sa.Column(name, sa.Float(), nullable=False, server_default="0") for name in STAT_COLUMNS],
        sa.UniqueConstraint("player_id", "season", "week", name="uq_player_season_week"),
    )
    op.create_index("ix_player_week_stats_season_week", "player_week_stats", ["season", "week"])


def downgrade() -> None:
    op.drop_index("ix_player_week_stats_season_week", table_name="player_week_stats")
    op.drop_table("player_week_stats")
    op.drop_index("ix_players_position", table_name="players")
    op.drop_table("players")
