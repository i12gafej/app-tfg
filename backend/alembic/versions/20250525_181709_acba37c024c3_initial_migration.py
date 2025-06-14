"""initial_migration

Revision ID: acba37c024c3
Revises: 
Create Date: 2025-05-25 18:17:09.548538+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = 'acba37c024c3'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
    
    op.create_table('users',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('admin', sa.Boolean(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('surname', sa.String(length=255), nullable=False),
    sa.Column('phone_number', sa.String(length=20), nullable=True),
    sa.Column('reset_token', sa.String(length=255), nullable=True),
    sa.Column('reset_token_expiration', sa.DateTime(), nullable=True),
    sa.Column('reset_token_state', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    
    
    op.create_table('dimensions',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    
    
    op.create_table('heritage_resources',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('ownership', sa.String(length=255), nullable=True),
    sa.Column('management_model', sa.String(length=255), nullable=True),
    sa.Column('postal_address', sa.String(length=255), nullable=True),
    sa.Column('web_address', sa.String(length=255), nullable=True),
    sa.Column('phone_number', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_heritage_resources_id'), 'heritage_resources', ['id'], unique=False)
    
    
    op.create_table('heritage_resource_typologies',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=True),
    sa.Column('typology', sa.String(length=255), nullable=False),
    sa.ForeignKeyConstraint(['resource_id'], ['heritage_resources.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_heritage_resource_typologies_id'), 'heritage_resource_typologies', ['id'], unique=False)
    
    
    op.create_table('heritage_resource_social_networks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=True),
    sa.Column('social_network', sa.String(length=255), nullable=False),
    sa.Column('url', sa.String(length=255), nullable=False),
    sa.ForeignKeyConstraint(['resource_id'], ['heritage_resources.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_heritage_resource_social_networks_id'), 'heritage_resource_social_networks', ['id'], unique=False)
    
    
    op.create_table('ods',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('dimension_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['dimension_id'], ['dimensions.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    
    
    op.create_table('goals',
    sa.Column('ods_id', sa.Integer(), nullable=False),
    sa.Column('goal_number', sa.String(length=2), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['ods_id'], ['ods.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('ods_id', 'goal_number')
    )
    
    
    op.create_table('sustainability_reports',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('heritage_resource_id', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('state', sa.Enum('Draft', 'Published', name='report_state'), nullable=False),
    sa.Column('observation', sa.Text(), nullable=False),
    sa.Column('cover_photo', sa.String(length=255), nullable=True),
    sa.Column('org_chart_figure', sa.String(length=255), nullable=True),
    sa.Column('scale', sa.Integer(), nullable=False),
    sa.Column('survey_state', sa.Enum('active', 'inactive', name='survey_state'), nullable=False),
    sa.Column('permissions', sa.Integer(), nullable=False),
    sa.Column('main_impact_weight', sa.DECIMAL(precision=5, scale=2), nullable=True),
    sa.Column('secondary_impact_weight', sa.DECIMAL(precision=5, scale=2), nullable=True),
    sa.Column('template', sa.Boolean(), nullable=False),
    sa.Column('published_report', sa.Text(), nullable=True),
    sa.Column('commitment_letter', sa.Text(), nullable=True),
    sa.Column('mission', sa.Text(), nullable=True),
    sa.Column('vision', sa.Text(), nullable=True),
    sa.Column('values', sa.Text(), nullable=True),
    sa.Column('org_chart_text', sa.Text(), nullable=True),
    sa.Column('stakeholders_description', sa.Text(), nullable=True),
    sa.Column('diagnosis_description', sa.Text(), nullable=True),
    sa.Column('materiality_text', sa.Text(), nullable=True),
    sa.Column('materiality_matrix_text', sa.Text(), nullable=True),
    sa.Column('main_secondary_impacts_text', sa.Text(), nullable=True),
    sa.Column('action_plan_text', sa.Text(), nullable=True),
    sa.Column('roadmap_description', sa.Text(), nullable=True),
    sa.Column('internal_consistency_description', sa.Text(), nullable=True),
    sa.Column('diffusion_text', sa.Text(), nullable=True),
    sa.Column('data_tables_text', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['heritage_resource_id'], ['heritage_resources.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('report_logos',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('logo', sa.String(length=255), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('report_norms',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('norm', sa.Text(), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('report_agreements',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('agreement', sa.Text(), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('report_bibliographies',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('reference', sa.Text(), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('report_photos',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('photo', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('sustainability_team_members',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('type', sa.Enum('manager', 'consultant', 'external_advisor', name='member_type'), nullable=False),
    sa.Column('organization', sa.String(length=255), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('stakeholders',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('type', sa.Enum('internal', 'external', name='stakeholder_type'), nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('material_topics',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('priority', sa.Enum('high', 'medium', 'low', name='priority_level'), nullable=True),
    sa.Column('main_objective', sa.Text(), nullable=True),
    sa.Column('goal_ods_id', sa.Integer(), nullable=True),
    sa.Column('goal_number', sa.String(length=2), nullable=True),
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['goal_ods_id', 'goal_number'], ['goals.ods_id', 'goals.goal_number'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['report_id'], ['sustainability_reports.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('secondary_ods_material_topics',
    sa.Column('ods_id', sa.Integer(), nullable=False),
    sa.Column('material_topic_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['material_topic_id'], ['material_topics.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['ods_id'], ['ods.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('ods_id', 'material_topic_id')
    )
    
    
    op.create_table('assessments',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('material_topic_id', sa.Integer(), nullable=False),
    sa.Column('stakeholder_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['material_topic_id'], ['material_topics.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['stakeholder_id'], ['stakeholders.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('diagnosis_indicators',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.Text(), nullable=False),
    sa.Column('type', sa.Enum('quantitative', 'qualitative', name='indicator_type'), nullable=False),
    sa.Column('material_topic_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['material_topic_id'], ['material_topics.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('diagnosis_indicators_quantitative',
    sa.Column('diagnosis_indicator_id', sa.Integer(), nullable=False),
    sa.Column('numeric_response', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('unit', sa.String(length=100), nullable=False),
    sa.ForeignKeyConstraint(['diagnosis_indicator_id'], ['diagnosis_indicators.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('diagnosis_indicator_id')
    )
    
    
    op.create_table('diagnosis_indicators_qualitative',
    sa.Column('diagnosis_indicator_id', sa.Integer(), nullable=False),
    sa.Column('response', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['diagnosis_indicator_id'], ['diagnosis_indicators.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('diagnosis_indicator_id')
    )
    
    
    op.create_table('specific_objectives',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('responsible', sa.String(length=255), nullable=True),
    sa.Column('material_topic_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['material_topic_id'], ['material_topics.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('actions',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('difficulty', sa.Enum('low', 'medium', 'high', name='difficulty_level'), nullable=True),
    sa.Column('execution_time', sa.String(length=100), nullable=True),
    sa.Column('ods_id', sa.Integer(), nullable=True),
    sa.Column('specific_objective_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['ods_id'], ['ods.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['specific_objective_id'], ['specific_objectives.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('secondary_ods_actions',
    sa.Column('action_id', sa.Integer(), nullable=False),
    sa.Column('specific_objective_id', sa.Integer(), nullable=False),
    sa.Column('ods_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['action_id'], ['actions.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['ods_id'], ['ods.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['specific_objective_id'], ['specific_objectives.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('action_id', 'ods_id')
    )
    
    
    op.create_table('performance_indicators',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.Text(), nullable=False),
    sa.Column('human_resources', sa.Text(), nullable=True),
    sa.Column('material_resources', sa.Text(), nullable=True),
    sa.Column('type', sa.Enum('quantitative', 'qualitative', name='indicator_type'), nullable=False),
    sa.Column('action_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['action_id'], ['actions.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    
    op.create_table('performance_indicators_quantitative',
    sa.Column('performance_indicator_id', sa.Integer(), nullable=False),
    sa.Column('numeric_response', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('unit', sa.String(length=100), nullable=False),
    sa.ForeignKeyConstraint(['performance_indicator_id'], ['performance_indicators.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('performance_indicator_id')
    )
    
    
    op.create_table('performance_indicators_qualitative',
    sa.Column('performance_indicator_id', sa.Integer(), nullable=False),
    sa.Column('response', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['performance_indicator_id'], ['performance_indicators.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('performance_indicator_id')
    )
    


def downgrade() -> None:
    
    op.drop_table('performance_indicators_qualitative')
    op.drop_table('performance_indicators_quantitative')
    op.drop_table('performance_indicators')
    op.drop_table('secondary_ods_actions')
    op.drop_table('actions')
    op.drop_table('specific_objectives')
    op.drop_table('diagnosis_indicators_qualitative')
    op.drop_table('diagnosis_indicators_quantitative')
    op.drop_table('diagnosis_indicators')
    op.drop_table('assessments')
    op.drop_table('secondary_ods_material_topics')
    op.drop_table('material_topics')
    op.drop_table('stakeholders')
    op.drop_table('sustainability_team_members')
    op.drop_table('report_photos')
    op.drop_table('report_bibliographies')
    op.drop_table('report_agreements')
    op.drop_table('report_norms')
    op.drop_table('report_logos')
    op.drop_table('sustainability_reports')
    op.drop_table('goals')
    op.drop_table('ods')
    op.drop_index(op.f('ix_heritage_resource_social_networks_id'), table_name='heritage_resource_social_networks')
    op.drop_table('heritage_resource_social_networks')
    op.drop_index(op.f('ix_heritage_resource_typologies_id'), table_name='heritage_resource_typologies')
    op.drop_table('heritage_resource_typologies')
    op.drop_index(op.f('ix_heritage_resources_id'), table_name='heritage_resources')
    op.drop_table('heritage_resources')
    op.drop_table('dimensions')
    op.drop_table('users')
    
