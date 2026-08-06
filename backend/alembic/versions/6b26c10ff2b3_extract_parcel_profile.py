"""extract_parcel_profile

Revision ID: 6b26c10ff2b3
Revises: 6e4a7a6d16cc
Create Date: 2026-08-03 11:16:36.344461

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b26c10ff2b3'
down_revision: Union[str, Sequence[str], None] = '6e4a7a6d16cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create parcelle_profile table
    op.create_table(
        'parcelle_profile',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('parcel_id', sa.Integer(), nullable=False),
        sa.Column('soil_type', sa.String(length=100), nullable=False),
        sa.Column('crop_type', sa.String(length=100), nullable=False),
        sa.Column('organic_carbon', sa.Float(), nullable=True),
        sa.Column('soil_ph', sa.Float(), nullable=True),
        sa.Column('irrigation_type', sa.String(length=30), nullable=True),
        sa.Column('crop_growth_stage', sa.String(length=30), nullable=True),
        sa.Column('mulching_used', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['parcel_id'], ['parcelle.id_parcelle'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('parcel_id')
    )

    # 2. Copy existing data from parcelle to parcelle_profile
    op.execute("""
        INSERT INTO parcelle_profile (
            parcel_id,
            soil_type,
            crop_type,
            organic_carbon,
            soil_ph,
            irrigation_type,
            crop_growth_stage,
            mulching_used
        )
        SELECT
            id_parcelle,
            type_sol,
            type_culture,
            organic_carbon,
            soil_ph,
            irrigation_type,
            crop_growth_stage,
            NULL
        FROM parcelle
    """)

    # 3. Drop migrated columns from parcelle table
    op.drop_column('parcelle', 'crop_growth_stage')
    op.drop_column('parcelle', 'irrigation_type')
    op.drop_column('parcelle', 'soil_ph')
    op.drop_column('parcelle', 'organic_carbon')
    op.drop_column('parcelle', 'type_culture')
    op.drop_column('parcelle', 'type_sol')


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Re-add agricultural columns to parcelle (initially nullable)
    op.add_column('parcelle', sa.Column('type_sol', sa.String(length=100), nullable=True))
    op.add_column('parcelle', sa.Column('type_culture', sa.String(length=100), nullable=True))
    op.add_column('parcelle', sa.Column('organic_carbon', sa.Float(), nullable=True))
    op.add_column('parcelle', sa.Column('soil_ph', sa.Float(), nullable=True))
    op.add_column('parcelle', sa.Column('irrigation_type', sa.String(length=30), nullable=True))
    op.add_column('parcelle', sa.Column('crop_growth_stage', sa.String(length=30), nullable=True))

    # 2. Copy data back from parcelle_profile to parcelle
    op.execute("""
        UPDATE parcelle
        SET
            type_sol = pp.soil_type,
            type_culture = pp.crop_type,
            organic_carbon = pp.organic_carbon,
            soil_ph = pp.soil_ph,
            irrigation_type = pp.irrigation_type,
            crop_growth_stage = pp.crop_growth_stage
        FROM parcelle_profile pp
        WHERE parcelle.id_parcelle = pp.parcel_id
    """)

    # 3. Alter columns back to NOT NULL constraints (where appropriate)
    op.alter_column('parcelle', 'type_sol', nullable=False)
    op.alter_column('parcelle', 'type_culture', nullable=False)

    # 4. Drop parcelle_profile table
    op.drop_table('parcelle_profile')
