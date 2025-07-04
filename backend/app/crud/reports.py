from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import (
    SustainabilityReport,
    HeritageResource,
    SustainabilityTeamMember,
    ReportPhoto as ReportPhotoModel,
    ReportLogo as ReportLogoModel,
    ReportAgreement as ReportAgreementModel,
    ReportBibliography as ReportBibliographyModel,
    ReportNorm as ReportNormModel,
    MaterialTopic,
    DiagnosisIndicator,
    DiagnosisIndicatorQualitative,
    DiagnosisIndicatorQuantitative,
    SpecificObjective,
    Action,
    PerformanceIndicator,
    PerformanceIndicatorQualitative,
    PerformanceIndicatorQuantitative,
    SecondaryODSAction,
    SecondaryODSMaterialTopic,
    Stakeholder
)
from app.schemas.reports import (
    SustainabilityReportCreate,
    SustainabilityReportUpdate,
    SustainabilityReportWithRole,
    UserReportRole,
    ReportNorm,
    ReportNormCreate,
    ReportNormUpdate,
    ReportLogoResponse,
    ReportLogo,
    ReportAgreement,
    ReportAgreementCreate,
    ReportAgreementUpdate,
    ReportBibliography,
    ReportBibliographyCreate,
    ReportBibliographyUpdate,
    ReportPhoto,
    ReportPhotoResponse
)

from app.schemas.diagnosis_indicators import DiagnosisIndicator as DiagnosisIndicatorSchema
import os
import base64
import uuid
import shutil
from pathlib import Path
from fastapi import HTTPException
from app.utils.image_processing import process_cover_image
from app.config import Settings
from fastapi import UploadFile
import requests
from io import BytesIO
from app.utils.graphs.materiality_matrix import create_materiality_matrix_data, generate_matrix_image
from app.utils.graphs.main_secondary_impacts import get_main_impacts_material_topics_graph, get_secondary_impacts_material_topics_graph
from app.utils.graphs.internal_consistency import generate_internal_consistency_graph, get_dimension_totals
from app.crud import resources as crud_resources
from app.crud import material_topics as crud_material_topic
from app.crud import diagnosis_indicators as crud_diagnosis_indicators
from app.crud import ods as crud_ods
from app.crud import action_plan as crud_action_plan
from app.crud import stakeholders as crud_stakeholders
from app.crud import team as crud_team
from app.crud import goals as crud_goals
from app.services.report_generator import ReportGenerator

settings = Settings()

def create_report(db: Session, report: SustainabilityReportCreate) -> SustainabilityReport:
    """
    Crea una memoria de sostenibilidad.
    """
    try:
        
        db_report = SustainabilityReport(**report.dict(exclude={'template_report_id'}))
        
        initialize_default_text(db_report)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        
        if report.template_report_id:
            transfer_report_data(db, report.template_report_id, db_report.id)
            transfer_report_images(db, report.template_report_id, db_report.id)

        return db_report
    except Exception as e:
        db.rollback()
        raise e


def search_reports(
    db: Session,
    user_id: Optional[int] = None,
    is_admin: bool = False,
    search_term: Optional[str] = None,
    heritage_resource_ids: Optional[List[int]] = None,
    year: Optional[int] = None,
    state: Optional[str] = None
) -> Tuple[List[SustainabilityReportWithRole], int]:
    """
    Busca memorias de sostenibilidad con los filtros especificados.
    Retorna una tupla con la lista de memorias y el total de resultados.
    """
    try:
        query = db.query(SustainabilityReport)
        
        
        if not is_admin and user_id:
            query = query.join(
                SustainabilityTeamMember,
                SustainabilityReport.id == SustainabilityTeamMember.report_id
            ).filter(SustainabilityTeamMember.user_id == user_id)
        
        
        if heritage_resource_ids:
            query = query.filter(SustainabilityReport.heritage_resource_id.in_(heritage_resource_ids))
        
        if year:
            query = query.filter(SustainabilityReport.year == year)
        
        if state:
            query = query.filter(SustainabilityReport.state == state)
        
        if search_term:
            query = query.filter(
                or_(
                    SustainabilityReport.observation.ilike(f"%{search_term}%")                  
                )
            )
        
        
        reports = query.all()
        
        
        reports_with_roles = []
        for report in reports:
            report_with_role = SustainabilityReportWithRole.from_orm(report)
            if not is_admin and user_id:
                team_member = db.query(SustainabilityTeamMember).filter(
                    SustainabilityTeamMember.report_id == report.id,
                    SustainabilityTeamMember.user_id == user_id
                ).first()
                if team_member:
                    report_with_role.user_role = UserReportRole(
                        report_id=report.id,
                        role=team_member.type,
                        organization=team_member.organization
                    )
            reports_with_roles.append(report_with_role)
        
        return reports_with_roles
    except Exception as e:
        raise e

def get_reports_by_resource_ids(
    db: Session,
    resource_ids: List[int],
    year: Optional[int] = None,
    state: Optional[str] = None
) -> List[SustainabilityReport]:
    """
    Busca memorias por una lista de IDs de recursos.
    """
    try:
        query = db.query(SustainabilityReport).filter(
            SustainabilityReport.heritage_resource_id.in_(resource_ids)
        )
        
        if year:
            query = query.filter(SustainabilityReport.year == year)
        
        if state:
            query = query.filter(SustainabilityReport.state == state)
        
        reports = query.all()
        
        return reports
    except Exception as e:
        raise e

def get_report(db: Session, report_id: int) -> Optional[SustainabilityReport]:
    """
    Obtiene una memoria de sostenibilidad.
    """
    try:
        return db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()
    except Exception as e:
        raise e

def get_all_report_templates(db: Session) -> List[tuple]:
    """
    Obtiene todas las memorias de sostenibilidad.
    """
    try:
        return db.query(
            HeritageResource.id,
            HeritageResource.name,
            SustainabilityReport.year,
            SustainabilityReport.id
        ).join(
            SustainabilityReport,
            HeritageResource.id == SustainabilityReport.heritage_resource_id
        ).filter(
            SustainabilityReport.template == True
        ).all()
    except Exception as e:
        raise e

def update_report(db: Session, report_id: int, report: SustainabilityReportUpdate) -> Optional[SustainabilityReport]:
    """
    Actualiza una memoria.
    """
    try:
        db_report = get_report(db, report_id)
        if db_report:
            for key, value in report.dict(exclude_unset=True).items():
                setattr(db_report, key, value)
        db.commit()
        db.refresh(db_report)
        return db_report
    except Exception as e:
        raise e

def delete_report(db: Session, report_id: int) -> bool:
    """
    Elimina una memoria.
    """
    try:
        db_report = get_report(db, report_id)
        if not db_report:
            return False

        
        
        if db_report.cover_photo:
            cover_path = settings.BASE_DIR / db_report.cover_photo.lstrip('/')
            if cover_path.exists():
                cover_path.unlink()

        
        if db_report.org_chart_figure:
            org_chart_path = settings.BASE_DIR / db_report.org_chart_figure.lstrip('/')
            if org_chart_path.exists():
                org_chart_path.unlink()

        
        logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == report_id).all()
        for logo in logos:
            logo_path = settings.BASE_DIR / logo.logo.lstrip('/')
            if logo_path.exists():
                logo_path.unlink()
            db.delete(logo)

        
        photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == report_id).all()
        for photo in photos:
            photo_path = settings.BASE_DIR / photo.photo.lstrip('/')
            if photo_path.exists():
                photo_path.unlink()
            db.delete(photo)

        
        report_dir = settings.REPORTS_DIR / str(report_id)
        if report_dir.exists():
            shutil.rmtree(report_dir)
            
        db.delete(db_report)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        raise e

import logging
logger = logging.getLogger(__name__)

def get_report_data(db: Session, report_id: int) -> Dict[str, Any]:
    """
    Obtiene todos los datos de una memoria de sostenibilidad, incluyendo:
    - Datos básicos de la memoria
    - Imágenes y archivos
    - Normativas
    - Logos
    - Acuerdos
    - Bibliografías
    - Fotos
    - Temas materiales
    - Información del recurso patrimonial
    - Indicadores de diagnóstico
    - Impactos secundarios
    - Acciones y objetivos
    - Grupos de interés
    - Miembros del equipo
    """
    try:
        
        report = get_report(db, report_id)
        if not report:
            raise Exception("Memoria no encontrada")

        
        resource = crud_resources.get(db, report.heritage_resource_id)
        
        norms = get_all_norms_by_report_id(db, report_id)
        logos = get_all_report_logos(db, report_id)
        agreements = get_all_report_agreements(db, report_id)
        bibliographies = get_all_report_bibliographies(db, report_id)
        photos = get_all_report_photos(db, report_id)
        material_topics = crud_material_topic.get_all_by_report(db, report_id)
        diagnosis_indicators:List[DiagnosisIndicatorSchema] = crud_diagnosis_indicators.get_all_by_report(db, report_id)
        secondary_impacts = crud_ods.get_all_secondary_impacts_by_report(db, report_id)
        ods = crud_ods.get_all_ods(db)
        goals = crud_goals.get_all_goals(db)
        action_secondary_impacts = crud_ods.get_all_action_secondary_impacts(db, report_id)
        action_secondary_impacts_counts = crud_ods.get_all_action_secondary_impacts_counts(db, report_id)
        primary_impacts = crud_action_plan.get_all_action_main_impacts(db, report_id)
        dimension_totals, dimension_totals_list = get_dimension_totals(primary_impacts, action_secondary_impacts_counts, float(report.main_impact_weight), float(report.secondary_impact_weight))
        
        
        
        action_plan = crud_action_plan.get_action_plan_by_report(db, report_id)
        
        
        stakeholders = crud_stakeholders.get_all_stakeholders_by_report(db, report_id)  
        
        team_members = crud_team.get_all_team_members_by_report(db, report_id)
        
        
        return {
            
            'id': report.id,
            'heritage_resource_id': report.heritage_resource_id,
            'heritage_resource_name': resource.name if resource else None,
            'year': report.year,
            'observation': report.observation,
            'ods': ods,
            'goals': goals,
            'main_impact_weight': report.main_impact_weight,
            'secondary_impact_weight': report.secondary_impact_weight,
            'scale': report.scale,
            'permissions': report.permissions,


            
            'commitment_letter': report.commitment_letter or "",
            'mission': report.mission or "",
            'vision': report.vision or "",
            'values': report.values or "",
            'org_chart_text': report.org_chart_text or "",
            'diagnosis_description': report.diagnosis_description or "",
            'action_plan_text': report.action_plan_text or "",
            'internal_consistency_description': report.internal_consistency_description or "",
            'roadmap_description': report.roadmap_description or "",
            'data_tables_text': report.data_tables_text or "",
            'stakeholders_description': report.stakeholders_description or "",
            'materiality_text': report.materiality_text or "",
            'main_secondary_impacts_text': report.main_secondary_impacts_text or "",
            'materiality_matrix_text': report.materiality_matrix_text or "",
            'internal_consistency_description': report.internal_consistency_description or "",
            'diffusion_text': report.diffusion_text or "",
            
            'cover_photo': report.cover_photo,
            'org_chart_figure': report.org_chart_figure,
            
            
            'resource': {
                'id': resource.id,
                'name': resource.name,
                'ownership': resource.ownership,
                'management_model': resource.management_model,
                'postal_address': resource.postal_address,
                'web_address': resource.web_address,
                'phone_number': resource.phone_number,
                'typologies': [t.typology for t in resource.typologies],
                'social_networks': [
                    {
                        'network': sn.social_network,
                        'url': sn.url
                    } for sn in resource.social_networks
                ]
            } if resource else None,
            
            
            'norms': norms or [],
            'logos': logos or [],
            'agreements': agreements or [],
            'bibliographies': bibliographies or [],
            'gallery': photos or [],
            'material_topics': material_topics or [],
            'diagnosis_indicators': diagnosis_indicators or [],
            'secondary_impacts': secondary_impacts or [],
            'action_secondary_impacts': action_secondary_impacts or [],
            'dimension_totals_list': dimension_totals_list,
            'dimension_totals': dimension_totals,
            'actions': action_plan['actions'] or [],
            'performance_indicators': action_plan['performance_indicators'] or [],
            'specific_objectives': action_plan['specific_objectives'] or [],
            'stakeholders': stakeholders or [],
            'team_members': team_members or []
        }

    except Exception as e:
        logger.error(f"Error al obtener los datos de la memoria: {str(e)}")
        raise 

def generate_report_html(db: Session, report_id: int) -> str:
    """
    Genera el HTML de una memoria de sostenibilidad.
    """
    try: 
        report_data = get_report_data(db, report_id)
        matrix_data = create_materiality_matrix_data(db, report_id, scale=report_data['scale'])
        def save_base64_image(data_url, path, base_dir=None, report_id=None):
            
            
            
            if report_id:
                report_dir = settings.REPORTS_DIR / str(report_id)
                if not os.path.exists(report_dir):
                    os.makedirs(report_dir, exist_ok=True)
                
                filename = os.path.basename(path)
                path = report_dir / filename
            
            header, encoded = data_url.split(',', 1)
            dir_path = os.path.dirname(path)
            if not os.path.exists(dir_path):
                os.makedirs(dir_path, exist_ok=True)
            with open(path, "wb") as f:
                f.write(base64.b64decode(encoded))
            
            
            if base_dir:
                relative_path = str(path).replace(str(base_dir), '').replace('/', '\\')
                if relative_path.startswith('\\'):
                    relative_path = relative_path[1:]
                return f"\\{base_dir.name}\\{relative_path}"
            return str(path)

        
        matrix_img_b64 = generate_matrix_image(matrix_data, scale=report_data['scale'])
        matrix_img_path = settings.REPORTS_DIR / f"{report_id}_materiality_matrix.png"
        report_data['materiality_matrix'] = save_base64_image(matrix_img_b64, matrix_img_path, settings.STATIC_DIR, report_id)
        report_data['legend'] = matrix_data

        
        main_impacts_img_b64 = get_main_impacts_material_topics_graph(report_data['material_topics'])
        main_impacts_img_path = settings.REPORTS_DIR / f"{report_id}_main_impacts.png"
        report_data['main_impacts_graph'] = save_base64_image(main_impacts_img_b64, main_impacts_img_path, settings.STATIC_DIR, report_id)

        
        secondary_impacts_img_b64 = get_secondary_impacts_material_topics_graph(report_data['secondary_impacts'])
        secondary_impacts_img_path = settings.REPORTS_DIR / f"{report_id}_secondary_impacts.png"
        report_data['secondary_impacts_graph'] = save_base64_image(secondary_impacts_img_b64, secondary_impacts_img_path, settings.STATIC_DIR, report_id)

        
        internal_consistency_img_b64, dimension_totals_list = generate_internal_consistency_graph(report_data['dimension_totals'])
        internal_consistency_img_path = settings.REPORTS_DIR / f"{report_id}_internal_consistency.png"
        report_data['internal_consistency_graph'] = save_base64_image(internal_consistency_img_b64, internal_consistency_img_path, settings.STATIC_DIR, report_id)
        report_data['dimension_totals'] = dimension_totals_list
        
        
        generator = ReportGenerator()
        url_preview = generator.generate_report_preview(report_data)
        url = generator.generate_report(report_data)
        logger.info(f"URL: {url_preview}")
        return url_preview
    except Exception as e:
        logger.error(f"Error al generar el HTML del reporte: {str(e)}")
        raise 

def get_all_norms_by_report_id(db: Session, report_id: int) -> List[ReportNorm]:
    """
    Obtiene todas las normas de una memoria.
    """
    try:
        return db.query(ReportNormModel).filter(ReportNormModel.report_id == report_id).all()
    except Exception as e:
        raise e

def create_norm(db: Session, norm: ReportNormCreate) -> ReportNorm:
    """
    Crea una normativa para una memoria.
    """
    try:
        db_norm = ReportNormModel(
            norm=norm.norm,
            report_id=norm.report_id
        )
        db.add(db_norm)
        db.commit()
        db.refresh(db_norm)
        return db_norm
    except Exception as e:
        raise e

def get_norm_by_id(db: Session, norm_id: int) -> ReportNorm:
    """
    Obtiene una normativa por su ID.
    """
    try:
        return db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
    except Exception as e:
        raise e

def update_norm(db: Session, norm_id: int, norm: ReportNormUpdate) -> ReportNorm:
    """
    Actualiza una normativa.
    """
    try:
        db_norm = get_norm_by_id(db, norm_id)
        if db_norm:
            for key, value in norm.dict(exclude_unset=True).items():
                setattr(db_norm, key, value)
        db.commit()
        db.refresh(db_norm)
        return db_norm
    except Exception as e:
        raise e

def delete_norm(db: Session, norm_id: int) -> bool:
    """
    Elimina una normativa.
    """
    try:
        db_norm = get_norm_by_id(db, norm_id)
        if db_norm:
            db.delete(db_norm)
        db.commit()
        return True
    except Exception as e:
        raise e

def update_cover_photo(db: Session, report: SustainabilityReport, content: bytes) -> str:
    """
    Actualiza la foto de portada de una memoria.
    """
    try:
        
        processed_image = process_cover_image(content)

        
        filename = f"report_{report.id}_cover_{uuid.uuid4()}.jpg"  
        file_path = settings.COVERS_DIR / filename

        
        with open(file_path, "wb") as file_object:
            file_object.write(processed_image)

        
        file_url = f"/static/uploads/covers/{filename}"
        report.cover_photo = file_url
        db.commit()
        return file_url
    except Exception as e:
        raise e

def upload_logo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str) -> str:
    """
    Carga un logo para una memoria.
    """
    try:
        
        filename = f"report_{report.id}_logo_{uuid.uuid4()}{file_extension}"
        file_path = settings.LOGOS_DIR / filename

        

        
        with open(file_path, "wb+") as file_object:
            file_object.write(content)

        
        file_url = f"/static/uploads/logos/{filename}"
        new_logo = ReportLogoModel(
            logo=file_url,
            report_id=report.id
        )
        db.add(new_logo)
        db.commit()
        db.refresh(new_logo)

        return new_logo
    except Exception as e:
        raise e

def update_organization_chart(db: Session, report: SustainabilityReport, content: bytes) -> str:
    """
    Actualiza el gráfico de organización de una memoria.
    """
    try:
        
        
        filename = f"report_{report.id}_organization_chart_{uuid.uuid4()}.jpg"
        file_path = settings.ORGANIZATION_CHART_DIR / filename

        
        settings.ORGANIZATION_CHART_DIR.mkdir(parents=True, exist_ok=True)

        with open(file_path, "wb") as file_object:
            file_object.write(content)

        file_url = f"/static/uploads/organization_charts/{filename}"
        report.org_chart_figure = file_url
        db.commit()
        return file_url
    except Exception as e:
        db.rollback()
        raise e

def get_all_report_logos(db: Session, report_id: int) -> List[ReportLogoResponse]:
    """
    Obtiene todos los logos de una memoria.
    """
    try:
        logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == report_id).all()
        logo_responses = []

        for logo in logos:
            try:
                
                relative_path = logo.logo.lstrip('/')
                file_path = settings.BASE_DIR / relative_path

                if not file_path.exists():
                    
                    continue
                

                
                with open(file_path, "rb") as image_file:            
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    
                    file_extension = file_path.suffix.lower()
                    mime_type = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png'
                    }.get(file_extension, 'image/jpeg')

                    
                    data_url = f"data:{mime_type};base64,{encoded_string}"

                    logo_responses.append(ReportLogoResponse(
                        id=logo.id,
                        logo=data_url,
                        report_id=logo.report_id
                    ))
            except Exception as e:
                
                continue
        
        return logo_responses
    except Exception as e:
        raise e

def get_logo_by_id(db: Session, logo_id: int) -> ReportLogoModel:
    """
    Obtiene un logo por su ID.
    """
    try:
        return db.query(ReportLogoModel).filter(ReportLogoModel.id == logo_id).first()
    except Exception as e:
        raise e

def delete_logo(db: Session, logo_id: int, logo: ReportLogoModel) -> bool:
    """
    Elimina un logo.
    """
    try:
        
        relative_path = logo.logo.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        
        if file_path.exists():
            try:
                file_path.unlink()  
                
            except Exception as e:
                raise e
                

        
        db.delete(logo)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_report_agreements(db: Session, report_id: int) -> List[ReportAgreement]:
    """
    Obtiene todos los acuerdos de una memoria.
    """
    try:
        return db.query(ReportAgreementModel).filter(ReportAgreementModel.report_id == report_id).all()
    except Exception as e:
        raise e



def create_agreement(db: Session, agreement: ReportAgreementCreate) -> ReportAgreement:
    """
    Crea un acuerdo para una memoria.
    """
    try:
        db_agreement = ReportAgreementModel(**agreement.dict())
        db.add(db_agreement)
        db.commit()
        db.refresh(db_agreement)
        return db_agreement
    except Exception as e:
        raise e

def get_agreement_by_id(db: Session, agreement_id: int) -> ReportAgreement:
    """
    Obtiene un acuerdo por su ID.
    """
    try:
        return db.query(ReportAgreementModel).filter(ReportAgreementModel.id == agreement_id).first()
    except Exception as e:
        raise e

def update_agreement(db: Session, agreement_id: int, agreement: ReportAgreementUpdate) -> ReportAgreement:
    """
    Actualiza un acuerdo.
    """
    try:
        db_agreement = get_agreement_by_id(db, agreement_id)
        if db_agreement:
            for key, value in agreement.dict().items():
                setattr(db_agreement, key, value)

        db.commit()
        db.refresh(db_agreement)
        return db_agreement
    except Exception as e:
        raise e

def delete_agreement(db: Session, agreement_id: int, agreement: ReportAgreement) -> bool:
    """
    Elimina un acuerdo.
    """
    try:
        db.delete(agreement)
        db.commit()
        return True
    except Exception as e:
        raise e

def create_bibliography(db: Session, bibliography: ReportBibliographyCreate) -> ReportBibliography:
    """
    Crea una referencia bibliográfica para una memoria.
    """
    try:
        db_bibliography = ReportBibliographyModel(**bibliography.dict())
        db.add(db_bibliography)
        db.commit()
        db.refresh(db_bibliography)
        return db_bibliography
    except Exception as e:
        raise e

def get_bibliography_by_id(db: Session, bibliography_id: int) -> ReportBibliography:
    """
    Obtiene una referencia bibliográfica por su ID.
    """
    try:
        return db.query(ReportBibliographyModel).filter(ReportBibliographyModel.id == bibliography_id).first()
    except Exception as e:
        raise e

def update_bibliography(db: Session, bibliography_id: int, bibliography: ReportBibliographyUpdate) -> ReportBibliography:
    """
    Actualiza una referencia bibliográfica.
    """
    try:
        db_bibliography = get_bibliography_by_id(db, bibliography_id)
        if db_bibliography:
            for key, value in bibliography.dict().items():
                setattr(db_bibliography, key, value)

        db.commit()
        db.refresh(db_bibliography)
        return db_bibliography
    except Exception as e:
        raise e

def delete_bibliography(db: Session, bibliography_id: int, bibliography: ReportBibliography) -> bool:
    """
    Elimina una referencia bibliográfica.
    """
    try:
        db.delete(bibliography)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_report_bibliographies(db: Session, report_id: int) -> List[ReportBibliography]:
    """
    Obtiene todas las referencias bibliográficas de una memoria.
    """
    try:
        return db.query(ReportBibliographyModel).filter(ReportBibliographyModel.report_id == report_id).all()
    except Exception as e:
        raise e

def upload_photo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str, description: str) -> ReportPhoto:
    """
    Carga una foto para una memoria.
    """
    try:
        
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        
        filename = f"report_{report.id}_photo_{uuid.uuid4()}{file_extension}"
        file_path = settings.PHOTOS_DIR / filename

        

        
        with open(file_path, "wb+") as file_object:
            file_object.write(content)

        
        file_url = f"/static/uploads/gallery/{filename}"
        new_photo = ReportPhotoModel(
            photo=file_url,
            description=description,
            report_id=report.id
        )
        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)
        return new_photo
    except Exception as e:
        raise e

def get_all_report_photos(db: Session, report_id: int) -> List[ReportPhoto]:
    """
    Obtiene todas las fotos de una memoria.
    """
    try:
        photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == report_id).all()
        photo_responses = []

        for photo in photos:
            try:
                
                relative_path = photo.photo.lstrip('/')
                file_path = settings.BASE_DIR / relative_path

                if not file_path.exists():
                    
                    continue

                
                with open(file_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    
                    file_extension = file_path.suffix.lower()
                    mime_type = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png'
                    }.get(file_extension, 'image/jpeg')

                    
                    data_url = f"data:{mime_type};base64,{encoded_string}"

                    photo_responses.append(ReportPhotoResponse(
                        id=photo.id,
                        photo=data_url,
                        description=photo.description,
                        report_id=photo.report_id
                    ))
            except Exception as e:
                
                continue

        return photo_responses
    except Exception as e:
        raise e

def get_photo_by_id(db: Session, photo_id: int) -> ReportPhoto:
    """
    Obtiene una foto por su ID.
    """
    try:
        return db.query(ReportPhotoModel).filter(ReportPhotoModel.id == photo_id).first()
    except Exception as e:
        raise e

def delete_photo(db: Session, photo_id: int, photo: ReportPhoto) -> bool:
    """
    Elimina una foto.
    """
    try:
        
        relative_path = photo.photo.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        
        if file_path.exists():
            try:
                file_path.unlink()  
                
            except Exception as e:
                raise e
                

        
        db.delete(photo)
        db.commit()
        return True
    except Exception as e:
        raise e

def update_photo(db: Session, photo_id: int, photo: ReportPhoto) -> ReportPhoto:
    """
    Actualiza una foto.
    """
    try:
        
        photo.description = photo_update.description

        db.commit()
        db.refresh(photo)

        
        relative_path = photo.photo.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        
        with open(file_path, "rb") as image_file:
            import base64
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
            
            file_extension = file_path.suffix.lower()
            mime_type = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png'
            }.get(file_extension, 'image/jpeg')

            
            data_url = f"data:{mime_type};base64,{encoded_string}"

        return ReportPhoto(
            id=photo.id,
            photo=data_url,
            description=photo.description,
            report_id=photo.report_id
        )

    except Exception as e:
        raise e


def get_team_member(db: Session, user_id: int, report_id: int) -> SustainabilityTeamMember:
    """
    Obtiene un miembro del equipo de una memoria.
    """
    try:
        return db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.user_id == user_id,
            SustainabilityTeamMember.report_id == report_id
        ).first()
    except Exception as e:
        raise e

def transfer_report_data(db: Session, template_report_id: int, new_report_id: int) -> None:
    """
    Transfiere todos los datos de texto y tablas relacionadas de una memoria a otra.
    """
    try:
        
        template_report = db.query(SustainabilityReport).filter(SustainabilityReport.id == template_report_id).first()
        if not template_report:
            raise HTTPException(status_code=404, detail="Memoria plantilla no encontrada")

        
        new_report = db.query(SustainabilityReport).filter(SustainabilityReport.id == new_report_id).first()
        if not new_report:
            raise HTTPException(status_code=404, detail="Nueva memoria no encontrada")

        
        text_attributes = [
            'commitment_letter', 'mission', 'vision', 'values',
            'org_chart_text', 'diagnosis_description',
            'internal_consistency_description', 'roadmap_description', 'data_tables_text',
            'stakeholders_description', 'materiality_text', 'main_secondary_impacts_text',
            'materiality_matrix_text', 'action_plan_text', 'diffusion_text'
        ]

        for attr in text_attributes:
            valor = getattr(template_report, attr)
            if valor not in [None, '']:
                setattr(new_report, attr, valor)
        
        db.commit()
        db.refresh(new_report)

        
        template_material_topics = db.query(MaterialTopic).filter(
            MaterialTopic.report_id == template_report_id
        ).all()

        
        material_topic_id_map = {}

        for mt in template_material_topics:
            new_mt = MaterialTopic(
                report_id=new_report_id,
                name=mt.name,
                description=mt.description,
                priority=mt.priority,
                main_objective=mt.main_objective,
                goal_ods_id=mt.goal_ods_id,
                goal_number=mt.goal_number
            )
            db.add(new_mt)
        
        db.commit()

        
        new_material_topics = db.query(MaterialTopic).filter(
            MaterialTopic.report_id == new_report_id
        ).all()
        
        for old_mt, new_mt in zip(template_material_topics, new_material_topics):
            material_topic_id_map[old_mt.id] = new_mt.id

        
        template_indicators = db.query(DiagnosisIndicator).filter(
            DiagnosisIndicator.material_topic_id.in_(material_topic_id_map.keys())
        ).all()

        indicator_id_map = {}

        for di in template_indicators:
            new_di = DiagnosisIndicator(
                name=di.name,
                type=di.type,
                material_topic_id=material_topic_id_map[di.material_topic_id]
            )
            db.add(new_di)
        
        db.commit()

        
        new_indicators = db.query(DiagnosisIndicator).filter(
            DiagnosisIndicator.material_topic_id.in_(material_topic_id_map.values())
        ).all()

        for old_di, new_di in zip(template_indicators, new_indicators):
            indicator_id_map[old_di.id] = new_di.id

        
        
        template_quantitative = db.query(DiagnosisIndicatorQuantitative).filter(
            DiagnosisIndicatorQuantitative.diagnosis_indicator_id.in_(indicator_id_map.keys())
        ).all()

        for diq in template_quantitative:
            new_diq = DiagnosisIndicatorQuantitative(
                diagnosis_indicator_id=indicator_id_map[diq.diagnosis_indicator_id],
                numeric_response=diq.numeric_response,
                unit=diq.unit
            )
            db.add(new_diq)

        
        template_qualitative = db.query(DiagnosisIndicatorQualitative).filter(
            DiagnosisIndicatorQualitative.diagnosis_indicator_id.in_(indicator_id_map.keys())
        ).all()

        for diq in template_qualitative:
            new_diq = DiagnosisIndicatorQualitative(
                diagnosis_indicator_id=indicator_id_map[diq.diagnosis_indicator_id],
                response=diq.response
            )
            db.add(new_diq)

        db.commit()

        
        template_objectives = db.query(SpecificObjective).filter(
            SpecificObjective.material_topic_id.in_(material_topic_id_map.keys())
        ).all()

        objective_id_map = {}

        for so in template_objectives:
            new_so = SpecificObjective(
                description=so.description,
                responsible=so.responsible,
                material_topic_id=material_topic_id_map[so.material_topic_id]
            )
            db.add(new_so)

        db.commit()

        
        new_objectives = db.query(SpecificObjective).filter(
            SpecificObjective.material_topic_id.in_(material_topic_id_map.values())
        ).all()

        for old_so, new_so in zip(template_objectives, new_objectives):
            objective_id_map[old_so.id] = new_so.id

        
        template_actions = db.query(Action).filter(
            Action.specific_objective_id.in_(objective_id_map.keys())
        ).all()

        action_id_map = {}

        for action in template_actions:
            new_action = Action(
                description=action.description,
                difficulty=action.difficulty,
                execution_time=action.execution_time,
                ods_id=action.ods_id,
                specific_objective_id=objective_id_map[action.specific_objective_id]
            )
            db.add(new_action)

        db.commit()

        
        new_actions = db.query(Action).filter(
            Action.specific_objective_id.in_(objective_id_map.values())
        ).all()

        for old_action, new_action in zip(template_actions, new_actions):
            action_id_map[old_action.id] = new_action.id

        
        template_performance = db.query(PerformanceIndicator).filter(
            PerformanceIndicator.action_id.in_(action_id_map.keys())
        ).all()

        performance_id_map = {}

        for pi in template_performance:
            new_pi = PerformanceIndicator(
                name=pi.name,
                human_resources=pi.human_resources,
                material_resources=pi.material_resources,
                type=pi.type,
                action_id=action_id_map[pi.action_id]
            )
            db.add(new_pi)

        db.commit()

        
        new_performance = db.query(PerformanceIndicator).filter(
            PerformanceIndicator.action_id.in_(action_id_map.values())
        ).all()

        for old_pi, new_pi in zip(template_performance, new_performance):
            performance_id_map[old_pi.id] = new_pi.id

        
        
        template_quantitative = db.query(PerformanceIndicatorQuantitative).filter(
            PerformanceIndicatorQuantitative.performance_indicator_id.in_(performance_id_map.keys())
        ).all()

        for piq in template_quantitative:
            new_piq = PerformanceIndicatorQuantitative(
                performance_indicator_id=performance_id_map[piq.performance_indicator_id],
                numeric_response=piq.numeric_response,
                unit=piq.unit
            )
            db.add(new_piq)

        
        template_qualitative = db.query(PerformanceIndicatorQualitative).filter(
            PerformanceIndicatorQualitative.performance_indicator_id.in_(performance_id_map.keys())
        ).all()

        for piq in template_qualitative:
            new_piq = PerformanceIndicatorQualitative(
                performance_indicator_id=performance_id_map[piq.performance_indicator_id],
                response=piq.response
            )
            db.add(new_piq)

        db.commit()

        
        template_secondary_ods = db.query(SecondaryODSAction).filter(
            SecondaryODSAction.action_id.in_(action_id_map.keys())
        ).all()

        for soa in template_secondary_ods:
            new_soa = SecondaryODSAction(
                action_id=action_id_map[soa.action_id],
                specific_objective_id=objective_id_map[soa.specific_objective_id],
                ods_id=soa.ods_id
            )
            db.add(new_soa)

        
        template_secondary_mt = db.query(SecondaryODSMaterialTopic).filter(
            SecondaryODSMaterialTopic.material_topic_id.in_(material_topic_id_map.keys())
        ).all()

        for somt in template_secondary_mt:
            new_somt = SecondaryODSMaterialTopic(
                material_topic_id=material_topic_id_map[somt.material_topic_id],
                ods_id=somt.ods_id
            )
            db.add(new_somt)

        
        template_stakeholders = db.query(Stakeholder).filter(
            Stakeholder.report_id == template_report_id
        ).all()

        stakeholder_id_map = {}

        for stakeholder in template_stakeholders:
            new_stakeholder = Stakeholder(
                name=stakeholder.name,
                description=stakeholder.description,
                type=stakeholder.type,
                report_id=new_report_id
            )
            db.add(new_stakeholder)

        db.commit()

        
        new_stakeholders = db.query(Stakeholder).filter(
            Stakeholder.report_id == new_report_id
        ).all()

        for old_st, new_st in zip(template_stakeholders, new_stakeholders):
            stakeholder_id_map[old_st.id] = new_st.id

        
        template_agreements = db.query(ReportAgreementModel).filter(
            ReportAgreementModel.report_id == template_report_id
        ).all()

        for agreement in template_agreements:
            new_agreement = ReportAgreementModel(
                report_id=new_report_id,
                agreement=agreement.agreement
            )
            db.add(new_agreement)

        
        template_bibliographies = db.query(ReportBibliographyModel).filter(
            ReportBibliographyModel.report_id == template_report_id
        ).all()

        for bibliography in template_bibliographies:
            new_bibliography = ReportBibliographyModel(
                report_id=new_report_id,
                reference=bibliography.reference
            )
            db.add(new_bibliography)

        
        template_norms = db.query(ReportNormModel).filter(
            ReportNormModel.report_id == template_report_id
        ).all()

        for norm in template_norms:
            new_norm = ReportNormModel(
                report_id=new_report_id,
                norm=norm.norm
            )
            db.add(new_norm)

        
        template_team_members = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == template_report_id
        ).all()

        for member in template_team_members:
            new_member = SustainabilityTeamMember(
                report_id=new_report_id,
                user_id=member.user_id,
                type=member.type,
                organization=member.organization
            )
            db.add(new_member)

        db.commit()

    except Exception as e:
        db.rollback()
        raise e

def transfer_report_images(db: Session, template_report_id: int, new_report_id: int) -> None:
    """
    Transfiere todas las imágenes de una memoria a otra, copiando los archivos físicos
    y actualizando las referencias en la base de datos.
    """
    try:
        
        template_report = db.query(SustainabilityReport).filter(SustainabilityReport.id == template_report_id).first()
        if not template_report:
            raise HTTPException(status_code=404, detail="Memoria plantilla no encontrada")

        
        new_report = db.query(SustainabilityReport).filter(SustainabilityReport.id == new_report_id).first()
        if not new_report:
            raise HTTPException(status_code=404, detail="Nueva memoria no encontrada")

        
        def copy_image(old_path: str, new_path: str) -> None:
            if not old_path:
                return

            
            old_abs_path = settings.BASE_DIR / old_path.lstrip('/')
            new_abs_path = settings.BASE_DIR / new_path.lstrip('/')

            
            new_abs_path.parent.mkdir(parents=True, exist_ok=True)

            
            if old_abs_path.exists():
                shutil.copy2(old_abs_path, new_abs_path)

        
        if template_report.cover_photo:
            old_filename = os.path.basename(template_report.cover_photo)
            new_filename = f"report_{new_report_id}_cover_{uuid.uuid4()}{os.path.splitext(old_filename)[1]}"
            new_path = str(settings.COVERS_DIR.relative_to(settings.BASE_DIR) / new_filename)
            copy_image(template_report.cover_photo, new_path)
            new_report.cover_photo = f"/{new_path}"

        
        if template_report.org_chart_figure:
            old_filename = os.path.basename(template_report.org_chart_figure)
            new_filename = f"report_{new_report_id}_organization_chart_{uuid.uuid4()}{os.path.splitext(old_filename)[1]}"
            new_path = str(settings.ORGANIZATION_CHART_DIR.relative_to(settings.BASE_DIR) / new_filename)
            copy_image(template_report.org_chart_figure, new_path)
            new_report.org_chart_figure = f"/{new_path}"

        
        logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == template_report_id).all()
        for logo in logos:
            old_filename = os.path.basename(logo.logo)
            new_filename = f"report_{new_report_id}_logo_{uuid.uuid4()}{os.path.splitext(old_filename)[1]}"
            new_path = str(settings.LOGOS_DIR.relative_to(settings.BASE_DIR) / new_filename)
            copy_image(logo.logo, new_path)
            
            new_logo = ReportLogoModel(
                report_id=new_report_id,
                logo=f"/{new_path}"
            )
            db.add(new_logo)

        
        photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == template_report_id).all()
        for photo in photos:
            old_filename = os.path.basename(photo.photo)
            new_filename = f"report_{new_report_id}_photo_{uuid.uuid4()}{os.path.splitext(old_filename)[1]}"
            new_path = str(settings.PHOTOS_DIR.relative_to(settings.BASE_DIR) / new_filename)
            copy_image(photo.photo, new_path)
            
            new_photo = ReportPhotoModel(
                report_id=new_report_id,
                photo=f"/{new_path}",
                description=photo.description
            )
            db.add(new_photo)

        db.commit()

    except Exception as e:
        db.rollback()
        raise e

def initialize_default_text(report):
    """
    Inicializa los textos por defecto de una memoria a partir de los archivos .html en DEFAULT_TEXT_DIR.
    """
    
    atributos = [
        'stakeholders_description',
        'diagnosis_description',
        'materiality_text',
        'main_secondary_impacts_text',
        'materiality_matrix_text',
        'action_plan_text',
        'internal_consistency_description',
        'diffusion_text',
    ]
    for attr in atributos:
        file_path = settings.DEFAULT_TEXT_DIR / f"{attr}.html"
        if file_path.exists():
            with open(file_path, encoding='utf-8') as f:
                setattr(report, attr, f.read())
