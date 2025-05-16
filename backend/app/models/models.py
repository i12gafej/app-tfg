from sqlalchemy import Column, Integer, String, Enum, Text, DECIMAL, ForeignKey, Boolean, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    admin = Column(Boolean, nullable=False, default=False)
    name = Column(String(100), nullable=False)
    surname = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)

class Dimension(Base):
    __tablename__ = "dimensions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

class ODS(Base):
    __tablename__ = "ods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    dimension_id = Column(Integer, ForeignKey("dimensions.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class Goal(Base):
    __tablename__ = "goals"

    ods_id = Column(Integer, ForeignKey("ods.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    goal_number = Column(String(2), primary_key=True)
    description = Column(Text, nullable=False)

class HeritageResource(Base):
    __tablename__ = "heritage_resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    ownership = Column(String(255), nullable=True)
    management_model = Column(String(255), nullable=True)
    postal_address = Column(String(255), nullable=True)
    web_address = Column(String(255), nullable=True)
    phone_number = Column(String(255), nullable=True)
    
    # Relaciones
    typologies = relationship("HeritageResourceTypology", back_populates="resource", cascade="all, delete-orphan")
    social_networks = relationship("HeritageResourceSocialNetwork", back_populates="resource", cascade="all, delete-orphan")

class HeritageResourceTypology(Base):
    __tablename__ = "heritage_resource_typologies"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("heritage_resources.id"))
    typology = Column(String(255), nullable=False)
    
    resource = relationship("HeritageResource", back_populates="typologies")

class HeritageResourceSocialNetwork(Base):
    __tablename__ = "heritage_resource_social_networks"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("heritage_resources.id"))
    social_network = Column(String(255), nullable=False)
    url = Column(String(255), nullable=False)
    
    resource = relationship("HeritageResource", back_populates="social_networks")

class SustainabilityReport(Base):
    __tablename__ = "sustainability_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    heritage_resource_id = Column(Integer, ForeignKey("heritage_resources.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    state = Column(Enum('Draft', 'Published', name='report_state'), nullable=False)
    observation = Column(Text, nullable=False)
    cover_photo = Column(String(255), nullable=True)
    commitment_letter = Column(Text, nullable=True)
    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    values = Column(Text, nullable=True)
    org_chart_text = Column(Text, nullable=True)
    org_chart_figure = Column(String(255), nullable=True)
    diagnosis_description = Column(Text, nullable=True)
    scale = Column(Integer, nullable=False, default=5)
    survey_state = Column(Enum('active', 'inactive', name='survey_state'), nullable=False, default='inactive')
    permissions = Column(Integer, nullable=False, default=0)
    action_plan_description = Column(Text, nullable=True)
    internal_coherence_description = Column(Text, nullable=True)
    main_impact_weight = Column(DECIMAL(5,2), nullable=True, default= 1.0)
    secondary_impact_weight = Column(DECIMAL(5,2), nullable=True, default= 1.0)
    roadmap_description = Column(Text, nullable=True)
    data_tables_text = Column(Text, nullable=True)
    
    stakeholders_text = Column(Text, nullable=True)
    materiality_text = Column(Text, nullable=True)
    main_secondary_impacts_text = Column(Text, nullable=True)
    materiality_matrix_text = Column(Text, nullable=True)
    action_plan_text = Column(Text, nullable=True)
    internal_coherence_text = Column(Text, nullable=True)
    diffusion_text = Column(Text, nullable=True)
    template = Column(Boolean, nullable=False, default=False)

class ReportLogo(Base):
    __tablename__ = "report_logos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    logo = Column(String(255), nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class ReportNorm(Base):
    __tablename__ = "report_norms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    norm = Column(Text, nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class ReportAgreement(Base):
    __tablename__ = "report_agreements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agreement = Column(Text, nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class ReportBibliography(Base):
    __tablename__ = "report_bibliographies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference = Column(Text, nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class ReportPhoto(Base):
    __tablename__ = "report_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    photo = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class SustainabilityTeamMember(Base):
    __tablename__ = "sustainability_team_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Enum('manager', 'consultant', 'external_advisor', name='member_type'), nullable=False)
    organization = Column(String(255), nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(Enum('internal', 'external', name='stakeholder_type'), nullable=False)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class MaterialTopic(Base):
    __tablename__ = "material_topics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum('high', 'medium', 'low', name='priority_level'), nullable=True)
    main_objective = Column(Text, nullable=True)
    goal_ods_id = Column(Integer, nullable=True)
    goal_number = Column(String(2), nullable=True)
    report_id = Column(Integer, ForeignKey("sustainability_reports.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ['goal_ods_id', 'goal_number'],
            ['goals.ods_id', 'goals.goal_number'],
            ondelete="CASCADE",
            onupdate="CASCADE"
        ),
    )

class SecondaryODSMaterialTopic(Base):
    __tablename__ = "secondary_ods_material_topics"

    ods_id = Column(Integer, ForeignKey("ods.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    material_topic_id = Column(Integer, ForeignKey("material_topics.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    score = Column(Integer, nullable=False)
    material_topic_id = Column(Integer, ForeignKey("material_topics.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    stakeholder_id = Column(Integer, ForeignKey("stakeholders.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class DiagnosticIndicator(Base):
    __tablename__ = "diagnostic_indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    type = Column(Enum('quantitative', 'qualitative', name='indicator_type'), nullable=False)
    material_topic_id = Column(Integer, ForeignKey("material_topics.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class DiagnosticIndicatorQuantitative(Base):
    __tablename__ = "diagnostic_indicators_quantitative"

    diagnostic_indicator_id = Column(Integer, ForeignKey("diagnostic_indicators.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    numeric_response = Column(DECIMAL(10,2), nullable=False)
    unit = Column(String(100), nullable=False)

class DiagnosticIndicatorQualitative(Base):
    __tablename__ = "diagnostic_indicators_qualitative"

    diagnostic_indicator_id = Column(Integer, ForeignKey("diagnostic_indicators.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    response = Column(Text, nullable=False)

class SpecificObjective(Base):
    __tablename__ = "specific_objectives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    execution_time = Column(String(100), nullable=True)
    responsible = Column(String(255), nullable=True)
    material_topic_id = Column(Integer, ForeignKey("material_topics.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum('low', 'medium', 'high', name='difficulty_level'), nullable=True)
    ods_id = Column(Integer, ForeignKey("ods.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    specific_objective_id = Column(Integer, ForeignKey("specific_objectives.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class SecondaryODSAction(Base):
    __tablename__ = "secondary_ods_actions"

    action_id = Column(Integer, ForeignKey("actions.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    specific_objective_id = Column(Integer, nullable=False)
    ods_id = Column(Integer, ForeignKey("ods.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['specific_objective_id'],
            ['specific_objectives.id'],
            ondelete="CASCADE",
            onupdate="CASCADE"
        ),
    )

class PerformanceIndicator(Base):
    __tablename__ = "performance_indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    human_resources = Column(Text, nullable=True)
    material_resources = Column(Text, nullable=True)
    type = Column(Enum('quantitative', 'qualitative', name='indicator_type'), nullable=False)
    action_id = Column(Integer, ForeignKey("actions.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

class PerformanceIndicatorQuantitative(Base):
    __tablename__ = "performance_indicators_quantitative"

    performance_indicator_id = Column(Integer, ForeignKey("performance_indicators.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    numeric_response = Column(DECIMAL(10,2), nullable=False)
    unit = Column(String(100), nullable=False)

class PerformanceIndicatorQualitative(Base):
    __tablename__ = "performance_indicators_qualitative"

    performance_indicator_id = Column(Integer, ForeignKey("performance_indicators.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    response = Column(Text, nullable=False) 