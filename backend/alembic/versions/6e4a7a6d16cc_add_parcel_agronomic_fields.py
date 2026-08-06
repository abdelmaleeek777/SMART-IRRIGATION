"""add parcel agronomic fields

Revision ID: 6e4a7a6d16cc
Revises: ab41ae9f1b1d
Create Date: 2026-08-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e4a7a6d16cc'
down_revision: Union[str, Sequence[str], None] = 'ab41ae9f1b1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('parcelle', sa.Column('organic_carbon', sa.Float(), nullable=True))
    op.add_column('parcelle', sa.Column('soil_ph', sa.Float(), nullable=True))
    op.add_column('parcelle', sa.Column('irrigation_type', sa.String(length=30), nullable=True))
    op.add_column('parcelle', sa.Column('crop_growth_stage', sa.String(length=30), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('parcelle', 'crop_growth_stage')
    op.drop_column('parcelle', 'irrigation_type')
    op.drop_column('parcelle', 'soil_ph')
    op.drop_column('parcelle', 'organic_carbon')
