from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import SustainabilityReport, HeritageResource, SustainabilityTeamMember, ReportPhoto as ReportPhotoModel, ReportLogo as ReportLogoModel, ReportAgreement as ReportAgreementModel, ReportBibliography as ReportBibliographyModel, ReportNorm as ReportNormModel
from app.schemas.reports import SustainabilityReportCreate, SustainabilityReportUpdate, SustainabilityReportWithRole, UserReportRole
from app.crud import resources as resources_crud
from app.schemas.reports import ReportNorm, ReportNormCreate, ReportNormUpdate
from app.schemas.reports import ReportLogoResponse, ReportLogo
from app.schemas.reports import ReportAgreement, ReportAgreementCreate, ReportAgreementUpdate
from app.schemas.reports import ReportBibliography, ReportBibliographyCreate, ReportBibliographyUpdate
from app.schemas.reports import ReportPhoto, ReportPhotoResponse
import os
import uuid
from fastapi import HTTPException
from app.utils.image_processing import process_cover_image
from app.core.config import Settings
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

settings = Settings().copy()


def create_report(db: Session, report: SustainabilityReportCreate) -> SustainabilityReport:
    db_report = SustainabilityReport(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

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
    query = db.query(SustainabilityReport)
    
    # Si no es admin, filtrar por memorias donde el usuario tiene rol
    if not is_admin and user_id:
        query = query.join(
            SustainabilityTeamMember,
            SustainabilityReport.id == SustainabilityTeamMember.report_id
        ).filter(SustainabilityTeamMember.user_id == user_id)
    
    # Aplicar filtros
    if heritage_resource_ids:
        query = query.filter(SustainabilityReport.heritage_resource_id.in_(heritage_resource_ids))
    
    if year:
        query = query.filter(SustainabilityReport.year == year)
    
    if state:
        query = query.filter(SustainabilityReport.state == state)
    
    if search_term:
        query = query.filter(
            or_(
                SustainabilityReport.observation.ilike(f"%{search_term}%"),
                SustainabilityReport.mission.ilike(f"%{search_term}%"),
                SustainabilityReport.vision.ilike(f"%{search_term}%")
            )
        )
    
    # Obtener total
    total = query.count()
    
    # Obtener todos los resultados sin paginación
    reports = query.all()
    
    # Obtener roles de usuario para cada memoria
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
    
    return reports_with_roles, total

def get_reports_by_resource_ids(
    db: Session,
    resource_ids: List[int],
    year: Optional[int] = None,
    state: Optional[str] = None
) -> Tuple[List[SustainabilityReport], int]:
    """
    Busca memorias por una lista de IDs de recursos.
    """
    query = db.query(SustainabilityReport).filter(
        SustainabilityReport.heritage_resource_id.in_(resource_ids)
    )
    
    if year:
        query = query.filter(SustainabilityReport.year == year)
    
    if state:
        query = query.filter(SustainabilityReport.state == state)
    
    total = query.count()
    reports = query.all()
    
    return reports, total

def get_report(db: Session, report_id: int) -> Optional[SustainabilityReport]:
    return db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()

def update_report(db: Session, report_id: int, report: SustainabilityReportUpdate) -> Optional[SustainabilityReport]:
    db_report = get_report(db, report_id)
    if db_report:
        for key, value in report.dict(exclude_unset=True).items():
            setattr(db_report, key, value)
        db.commit()
        db.refresh(db_report)
    return db_report

def delete_report(db: Session, report_id: int) -> bool:
    db_report = get_report(db, report_id)
    if db_report:
        db.delete(db_report)
        db.commit()
        return True
    return False

def get_norms_by_report_id(db: Session, report_id: int) -> List[ReportNorm]:
    return db.query(ReportNormModel).filter(ReportNormModel.report_id == report_id).all()

def create_norm(db: Session, norm: ReportNormCreate) -> ReportNorm:
    db_norm = ReportNormModel(
        norm=norm.norm,
        report_id=norm.report_id
    )
    db.add(db_norm)
    db.commit()
    db.refresh(db_norm)
    return db_norm

def get_norm_by_id(db: Session, norm_id: int) -> ReportNorm:
    return db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()

def update_norm(db: Session, norm_id: int, norm: ReportNormUpdate) -> ReportNorm:
    db_norm = get_norm_by_id(db, norm_id)
    if db_norm:
        for key, value in norm.dict(exclude_unset=True).items():
            setattr(db_norm, key, value)
        db.commit()
        db.refresh(db_norm)
    return db_norm

def delete_norm(db: Session, norm_id: int) -> bool:
    db_norm = get_norm_by_id(db, norm_id)
    if db_norm:
        db.delete(db_norm)
        db.commit()
        return True
    return False

def update_cover_photo(db: Session, report: SustainabilityReport, content: bytes) -> str:
        
    # Procesar la imagen
    processed_image = process_cover_image(content)

    # Crear nombre único para el archivo
    filename = f"report_{report.id}_cover_{uuid.uuid4()}.jpg"  # Siempre guardamos como JPG
    file_path = settings.COVERS_DIR / filename

    # Guardar el archivo procesado
    with open(file_path, "wb") as file_object:
        file_object.write(processed_image)

    # Actualizar la URL en la base de datos
    file_url = f"/static/uploads/covers/{filename}"
    report.cover_photo = file_url
    db.commit()
    return file_url

def upload_logo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str) -> str:
        # Crear nombre único para el archivo
        filename = f"report_{report.id}_logo_{uuid.uuid4()}{file_extension}"
        file_path = settings.LOGOS_DIR / filename

        logger.info(f"Guardando logo en: {file_path}")

        # Guardar el archivo
        with open(file_path, "wb+") as file_object:
            file_object.write(content)

        # Crear registro en la base de datos (usando ruta relativa para la URL)
        file_url = f"/static/uploads/logos/{filename}"
        new_logo = ReportLogoModel(
            logo=file_url,
            report_id=report.id
        )
        db.add(new_logo)
        db.commit()
        db.refresh(new_logo)

        return new_logo

def update_organization_chart(db: Session, report: SustainabilityReport, content: bytes) -> str:
    filename = f"report_{report.id}_organization_chart_{uuid.uuid4()}.jpg"
    file_path = settings.ORGANIZATION_CHART_DIR / filename

    with open(file_path, "wb") as file_object:
        file_object.write(content)

    file_url = f"/static/uploads/organization_charts/{filename}"
    report.org_chart_figure = file_url
    db.commit()
    return file_url

def get_report_logos(db: Session, report_id: int) -> List[ReportLogoResponse]:
    logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == report_id).all()
    logo_responses = []

    for logo in logos:
        try:
            # Convertir la ruta relativa a absoluta
            relative_path = logo.logo.lstrip('/')
            file_path = settings.BASE_DIR / relative_path

            if not file_path.exists():
                logger.warning(f"Archivo de logo no encontrado: {file_path}")
                continue
            logger.info(f"Archivo de logo encontrado: {file_path}")

            # Leer el archivo y convertirlo a base64
            with open(file_path, "rb") as image_file:
                import base64
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                
                # Determinar el tipo MIME basado en la extensión del archivo
                file_extension = file_path.suffix.lower()
                mime_type = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png'
                }.get(file_extension, 'image/jpeg')

                # Crear data URL
                data_url = f"data:{mime_type};base64,{encoded_string}"

                logo_responses.append(ReportLogoResponse(
                    id=logo.id,
                    logo=data_url,
                    report_id=logo.report_id
                ))
        except Exception as e:
            logger.error(f"Error al procesar el logo {logo.id}: {str(e)}")
            continue
    
    return logo_responses

def get_logo_by_id(db: Session, logo_id: int) -> ReportLogoModel:
    return db.query(ReportLogoModel).filter(ReportLogoModel.id == logo_id).first()

def delete_logo(db: Session, logo_id: int, logo: ReportLogoModel) -> bool:
    # Convertir la ruta relativa a absoluta
    relative_path = logo.logo.lstrip('/')
    file_path = settings.BASE_DIR / relative_path

    # Eliminar el archivo físico si existe
    if file_path.exists():
        try:
            file_path.unlink()  # Eliminar el archivo
            logger.info(f"Archivo eliminado exitosamente: {file_path}")
        except Exception as e:
            logger.error(f"Error al eliminar el archivo físico: {str(e)}")
            # Continuamos con la eliminación del registro aunque falle la eliminación del archivo

    # Eliminar el registro de la base de datos
    db.delete(logo)
    db.commit()
    return True

def get_report_agreements(db: Session, report_id: int) -> List[ReportAgreement]:
    return db.query(ReportAgreementModel).filter(ReportAgreementModel.report_id == report_id).all()

def create_agreement(db: Session, agreement: ReportAgreementCreate) -> ReportAgreement:
    db_agreement = ReportAgreement(**agreement.dict())
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    return db_agreement

def get_agreement_by_id(db: Session, agreement_id: int) -> ReportAgreement:
    return db.query(ReportAgreementModel).filter(ReportAgreementModel.id == agreement_id).first()

def update_agreement(db: Session, agreement_id: int, agreement: ReportAgreementUpdate) -> ReportAgreement:
    for key, value in agreement.dict().items():
        setattr(db_agreement, key, value)

    db.commit()
    db.refresh(db_agreement)
    return db_agreement

def delete_agreement(db: Session, agreement_id: int, agreement: ReportAgreement) -> bool:
    db.delete(agreement)
    db.commit()
    return True

def create_bibliography(db: Session, bibliography: ReportBibliographyCreate) -> ReportBibliography:
    db_bibliography = ReportBibliography(**bibliography.dict())
    db.add(db_bibliography)
    db.commit()
    db.refresh(db_bibliography)
    return db_bibliography

def get_bibliography_by_id(db: Session, bibliography_id: int) -> ReportBibliography:
    return db.query(ReportBibliography).filter(ReportBibliography.id == bibliography_id).first()

def update_bibliography(db: Session, bibliography_id: int, bibliography: ReportBibliographyUpdate) -> ReportBibliography:
    for key, value in bibliography.dict().items():
        setattr(db_bibliography, key, value)

    db.commit()
    db.refresh(db_bibliography)
    return db_bibliography

def delete_bibliography(db: Session, bibliography_id: int, bibliography: ReportBibliography) -> bool:
    db.delete(bibliography)
    db.commit()
    return True

def get_report_bibliographies(db: Session, report_id: int) -> List[ReportBibliography]:
    return db.query(ReportBibliographyModel).filter(ReportBibliographyModel.report_id == report_id).all()

def upload_photo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str, description: str) -> ReportPhoto:
    # Verificar extensión del archivo
    if file_extension not in ['.jpg', '.jpeg', '.png']:
        raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

    # Crear nombre único para el archivo
    filename = f"report_{report.id}_photo_{uuid.uuid4()}{file_extension}"
    file_path = settings.PHOTOS_DIR / filename

    logger.info(f"Guardando foto en: {file_path}")

    # Guardar el archivo
    with open(file_path, "wb+") as file_object:
        file_object.write(content)

    # Crear registro en la base de datos
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

def get_report_photos(db: Session, report_id: int) -> List[ReportPhoto]:
    photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == report_id).all()
    photo_responses = []

    for photo in photos:
        try:
            # Convertir la ruta relativa a absoluta
            relative_path = photo.photo.lstrip('/')
            file_path = settings.BASE_DIR / relative_path

            if not file_path.exists():
                logger.warning(f"Archivo de foto no encontrado: {file_path}")
                continue

            # Leer el archivo y convertirlo a base64
            with open(file_path, "rb") as image_file:
                import base64
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                
                # Determinar el tipo MIME basado en la extensión del archivo
                file_extension = file_path.suffix.lower()
                mime_type = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png'
                }.get(file_extension, 'image/jpeg')

                # Crear data URL
                data_url = f"data:{mime_type};base64,{encoded_string}"

                photo_responses.append(ReportPhotoResponse(
                    id=photo.id,
                    photo=data_url,
                    description=photo.description,
                    report_id=photo.report_id
                ))
        except Exception as e:
            logger.error(f"Error al procesar la foto {photo.id}: {str(e)}")
            continue

    return photo_responses

def get_photo_by_id(db: Session, photo_id: int) -> ReportPhoto:
    return db.query(ReportPhotoModel).filter(ReportPhotoModel.id == photo_id).first()

def delete_photo(db: Session, photo_id: int, photo: ReportPhoto) -> bool:
    # Convertir la ruta relativa a absoluta
    relative_path = photo.photo.lstrip('/')
    file_path = settings.BASE_DIR / relative_path

    # Eliminar el archivo físico si existe
    if file_path.exists():
        try:
            file_path.unlink()  # Eliminar el archivo
            logger.info(f"Archivo eliminado exitosamente: {file_path}")
        except Exception as e:
            logger.error(f"Error al eliminar el archivo físico: {str(e)}")
            # Continuamos con la eliminación del registro aunque falle la eliminación del archivo

    # Eliminar el registro de la base de datos
    db.delete(photo)
    db.commit()
    return True

def update_photo(db: Session, photo_id: int, photo: ReportPhoto) -> ReportPhoto:
    # Actualizar la descripción
    photo.description = photo_update.description

    db.commit()
    db.refresh(photo)

    # Convertir la ruta relativa a absoluta para obtener la imagen
    relative_path = photo.photo.lstrip('/')
    file_path = settings.BASE_DIR / relative_path

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    # Leer el archivo y convertirlo a base64
    with open(file_path, "rb") as image_file:
        import base64
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Determinar el tipo MIME basado en la extensión del archivo
        file_extension = file_path.suffix.lower()
        mime_type = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }.get(file_extension, 'image/jpeg')

        # Crear data URL
        data_url = f"data:{mime_type};base64,{encoded_string}"

    return ReportPhoto(
        id=photo.id,
        photo=data_url,
        description=photo.description,
        report_id=photo.report_id
    )


def get_team_member(db: Session, user_id: int, report_id: int) -> SustainabilityTeamMember:
    return db.query(SustainabilityTeamMember).filter(
        SustainabilityTeamMember.user_id == user_id,
        SustainabilityTeamMember.report_id == report_id
    ).first()