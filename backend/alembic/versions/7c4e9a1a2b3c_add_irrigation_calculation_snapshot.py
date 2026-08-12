"""add irrigation calculation snapshot fields

Revision ID: 7c4e9a1a2b3c
Revises: 0bced59ff48a
"""
from alembic import op
import sqlalchemy as sa

revision = "7c4e9a1a2b3c"
down_revision = "0bced59ff48a"
branch_labels = None
depends_on = None


def upgrade():
    for name in ("et0_mm", "kc", "etc_mm", "effective_rainfall_mm", "net_irrigation_mm",
                 "irrigation_efficiency", "gross_irrigation_mm", "recommended_irrigation_mm",
                 "recommended_volume_m3"):
        op.add_column("prediction_history", sa.Column(name, sa.Float(), nullable=True))
    op.create_index("ix_prediction_history_parcel_date", "prediction_history", ["parcel_id", "predicted_at"])


def downgrade():
    op.drop_index("ix_prediction_history_parcel_date", table_name="prediction_history")
    for name in ("recommended_volume_m3", "recommended_irrigation_mm", "gross_irrigation_mm",
                 "irrigation_efficiency", "net_irrigation_mm", "effective_rainfall_mm", "etc_mm", "kc", "et0_mm"):
        op.drop_column("prediction_history", name)
