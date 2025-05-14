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

settings = Settings()

def create_report(db: Session, report: SustainabilityReportCreate) -> SustainabilityReport:
    try:
        db_report = SustainabilityReport(**report.dict())
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return db_report
    except Exception as e:
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
    try:
        return db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()
    except Exception as e:
        raise e

def update_report(db: Session, report_id: int, report: SustainabilityReportUpdate) -> Optional[SustainabilityReport]:
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
    try:
        db_report = get_report(db, report_id)
        if db_report:
            db.delete(db_report)
            db.commit()
            return True
        return False
    except Exception as e:
        raise e

def get_all_norms_by_report_id(db: Session, report_id: int) -> List[ReportNorm]:
    try:
        return db.query(ReportNormModel).filter(ReportNormModel.report_id == report_id).all()
    except Exception as e:
        raise e

def create_norm(db: Session, norm: ReportNormCreate) -> ReportNorm:
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
    try:
        return db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
    except Exception as e:
        raise e

def update_norm(db: Session, norm_id: int, norm: ReportNormUpdate) -> ReportNorm:
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
    try:
        db_norm = get_norm_by_id(db, norm_id)
        if db_norm:
            db.delete(db_norm)
        db.commit()
        return True
    except Exception as e:
        raise e

def update_cover_photo(db: Session, report: SustainabilityReport, content: bytes) -> str:
    try:
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
    except Exception as e:
        raise e

def upload_logo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str) -> str:
    try:
        # Crear nombre único para el archivo
        filename = f"report_{report.id}_logo_{uuid.uuid4()}{file_extension}"
        file_path = settings.LOGOS_DIR / filename

        

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
    except Exception as e:
        raise e

def update_organization_chart(db: Session, report: SustainabilityReport, content: bytes) -> str:
    try:
        filename = f"report_{report.id}_organization_chart_{uuid.uuid4()}.jpg"
        file_path = settings.ORGANIZATION_CHART_DIR / filename

        with open(file_path, "wb") as file_object:
            file_object.write(content)

        file_url = f"/static/uploads/organization_charts/{filename}"
        report.org_chart_figure = file_url
        db.commit()
        return file_url
    except Exception as e:
        raise e

def get_all_report_logos(db: Session, report_id: int) -> List[ReportLogoResponse]:
    try:
        logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == report_id).all()
        logo_responses = []

        for logo in logos:
            try:
                # Convertir la ruta relativa a absoluta
                relative_path = logo.logo.lstrip('/')
                file_path = settings.BASE_DIR / relative_path

                if not file_path.exists():
                    
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
    try:
        return db.query(ReportLogoModel).filter(ReportLogoModel.id == logo_id).first()
    except Exception as e:
        raise e

def delete_logo(db: Session, logo_id: int, logo: ReportLogoModel) -> bool:
    try:
        # Convertir la ruta relativa a absoluta
        relative_path = logo.logo.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        # Eliminar el archivo físico si existe
        if file_path.exists():
            try:
                file_path.unlink()  # Eliminar el archivo
                
            except Exception as e:
                raise e
                # Continuamos con la eliminación del registro aunque falle la eliminación del archivo

        # Eliminar el registro de la base de datos
        db.delete(logo)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_report_agreements(db: Session, report_id: int) -> List[ReportAgreement]:
    try:
        return db.query(ReportAgreementModel).filter(ReportAgreementModel.report_id == report_id).all()
    except Exception as e:
        raise e

def create_agreement(db: Session, agreement: ReportAgreementCreate) -> ReportAgreement:
    try:
        db_agreement = ReportAgreement(**agreement.dict())
        db.add(db_agreement)
        db.commit()
        db.refresh(db_agreement)
        return db_agreement
    except Exception as e:
        raise e

def get_agreement_by_id(db: Session, agreement_id: int) -> ReportAgreement:
    try:
        return db.query(ReportAgreementModel).filter(ReportAgreementModel.id == agreement_id).first()
    except Exception as e:
        raise e

def update_agreement(db: Session, agreement_id: int, agreement: ReportAgreementUpdate) -> ReportAgreement:
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
    try:
        db.delete(agreement)
        db.commit()
        return True
    except Exception as e:
        raise e

def create_bibliography(db: Session, bibliography: ReportBibliographyCreate) -> ReportBibliography:
    try:
        db_bibliography = ReportBibliography(**bibliography.dict())
        db.add(db_bibliography)
        db.commit()
        db.refresh(db_bibliography)
        return db_bibliography
    except Exception as e:
        raise e

def get_bibliography_by_id(db: Session, bibliography_id: int) -> ReportBibliography:
    try:
        return db.query(ReportBibliography).filter(ReportBibliography.id == bibliography_id).first()
    except Exception as e:
        raise e

def update_bibliography(db: Session, bibliography_id: int, bibliography: ReportBibliographyUpdate) -> ReportBibliography:
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
    try:
        db.delete(bibliography)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_report_bibliographies(db: Session, report_id: int) -> List[ReportBibliography]:
    try:
        return db.query(ReportBibliographyModel).filter(ReportBibliographyModel.report_id == report_id).all()
    except Exception as e:
        raise e

def upload_photo(db: Session, report: SustainabilityReport, content: bytes, file_extension: str, description: str) -> ReportPhoto:
    try:
        # Verificar extensión del archivo
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Crear nombre único para el archivo
        filename = f"report_{report.id}_photo_{uuid.uuid4()}{file_extension}"
        file_path = settings.PHOTOS_DIR / filename

        

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
    except Exception as e:
        raise e

def get_all_report_photos(db: Session, report_id: int) -> List[ReportPhoto]:
    try:
        photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == report_id).all()
        photo_responses = []

        for photo in photos:
            try:
                # Convertir la ruta relativa a absoluta
                relative_path = photo.photo.lstrip('/')
                file_path = settings.BASE_DIR / relative_path

                if not file_path.exists():
                    
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
                
                continue

        return photo_responses
    except Exception as e:
        raise e

def get_photo_by_id(db: Session, photo_id: int) -> ReportPhoto:
    try:
        return db.query(ReportPhotoModel).filter(ReportPhotoModel.id == photo_id).first()
    except Exception as e:
        raise e

def delete_photo(db: Session, photo_id: int, photo: ReportPhoto) -> bool:
    try:
        # Convertir la ruta relativa a absoluta
        relative_path = photo.photo.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        # Eliminar el archivo físico si existe
        if file_path.exists():
            try:
                file_path.unlink()  # Eliminar el archivo
                
            except Exception as e:
                raise e
                # Continuamos con la eliminación del registro aunque falle la eliminación del archivo

        # Eliminar el registro de la base de datos
        db.delete(photo)
        db.commit()
        return True
    except Exception as e:
        raise e

def update_photo(db: Session, photo_id: int, photo: ReportPhoto) -> ReportPhoto:
    try:
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

    except Exception as e:
        raise e


def get_team_member(db: Session, user_id: int, report_id: int) -> SustainabilityTeamMember:
    try:
        return db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.user_id == user_id,
            SustainabilityTeamMember.report_id == report_id
        ).first()
    except Exception as e:
        raise e
