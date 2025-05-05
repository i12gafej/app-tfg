from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
import os
import uuid
from pathlib import Path
from app.api.deps import get_db, get_current_user
from app.crud import reports as reports_crud
from app.crud import resources as resources_crud
from app.schemas.reports import (
    SustainabilityReport, 
    SustainabilityReportCreate, 
    SustainabilityReportUpdate, 
    ReportUpdateRequest,
    ReportNorm,
    ReportNormCreate,
    ReportNormUpdate,
    ReportLogo,
    ReportLogoResponse,
    ReportAgreement,
    ReportAgreementCreate,
    ReportAgreementUpdate,
    ReportBibliography,
    ReportBibliographyCreate,
    ReportBibliographyUpdate,
    ReportPhoto,
    ReportPhotoResponse,
    ReportPhotoUpdate,
    UserRoleResponse,
    ReportResponse
)
from app.schemas.auth import TokenData
from app.models.models import SustainabilityReport as SustainabilityReportModel, HeritageResource, ReportNorm as ReportNormModel, ReportLogo as ReportLogoModel, ReportAgreement as ReportAgreementModel, ReportBibliography as ReportBibliographyModel, ReportPhoto as ReportPhotoModel, SustainabilityTeamMember
from app.services.user import check_user_permissions
import logging
from PIL import Image
from app.core.config import Settings
import io

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = Settings().copy()

router = APIRouter()

@router.get("/reports/get/{report_id}", response_model=SustainabilityReport)
async def get_report_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener una memoria de sostenibilidad por su ID.
    Permite el acceso si el usuario es admin o si tiene un rol asignado en el reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = reports_crud.get_report(db=db, report_id=report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )
        return report

    except Exception as e:
        logger.error(f"Error al obtener la memoria: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener la memoria: {str(e)}"
        )

@router.post("/reports/search", response_model=dict)
async def search_reports_endpoint(
    search_params: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar memorias de sostenibilidad con filtros opcionales.
    """
    try:
        # Extraer parámetros de búsqueda del objeto search_params
        params = search_params.get('search_params', {})
        search_term = params.get('search_term')
        heritage_resource_name = params.get('heritage_resource_name')
        year = params.get('year')
        state = params.get('state')
        page = params.get('page', 1)
        per_page = params.get('per_page', 10)

        logger.info(f"Parámetros de búsqueda recibidos: {params}")

        # Caso 1: Búsqueda por nombre de recurso
        if heritage_resource_name:
            logger.info(f"Realizando búsqueda por nombre de recurso: {heritage_resource_name}")
            # Buscar recursos por nombre
            resources = resources_crud.search(
                db=db,
                name=heritage_resource_name,
                skip=0,
                limit=1000
            )
            
            if not resources:
                logger.info("No se encontraron recursos con ese nombre")
                return {
                    "items": [],
                    "total": 0,
                    "page": page,
                    "per_page": per_page,
                    "total_pages": 0
                }
            
            # Obtener IDs de recursos
            resource_ids = [r.id for r in resources]
            logger.info(f"IDs de recursos encontrados: {resource_ids}")
            
            # Buscar memorias por IDs de recursos y otros filtros
            reports, total = reports_crud.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                heritage_resource_ids=resource_ids,
                year=year,
                state=state,
                skip=(page - 1) * per_page,
                limit=per_page
            )
        
        # Caso 2: Búsqueda por año y/o estado
        elif year or state:
            logger.info(f"Realizando búsqueda por año: {year} y estado: {state}")
            reports, total = reports_crud.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                year=year,
                state=state,
                skip=(page - 1) * per_page,
                limit=per_page
            )
        
        # Caso 3: Búsqueda por término de búsqueda
        elif search_term:
            logger.info(f"Realizando búsqueda por término: {search_term}")
            # Buscar recursos por nombre
            resources = resources_crud.search(
                db=db,
                name=search_term,
                skip=0,
                limit=1000
            )
            
            # Obtener IDs de recursos
            resource_ids = [r.id for r in resources]
            
            # Buscar memorias por IDs de recursos
            reports, total = reports_crud.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                heritage_resource_ids=resource_ids,
                skip=(page - 1) * per_page,
                limit=per_page
            )
        
        # Caso 4: Sin filtros, devolver todas las memorias
        else:
            logger.info("No se proporcionaron filtros de búsqueda, devolviendo todas las memorias")
            reports, total = reports_crud.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                skip=(page - 1) * per_page,
                limit=per_page
            )

        logger.info(f"Memorias encontradas: {len(reports)}")

        # Obtener los recursos asociados a las memorias
        resource_ids = [report.heritage_resource_id for report in reports]
        resources = db.query(HeritageResource).filter(HeritageResource.id.in_(resource_ids)).all()
        
        # Crear un diccionario para acceder rápidamente a los recursos por ID
        resources_dict = {resource.id: resource for resource in resources}

        # Añadir el nombre del recurso a cada memoria
        for report in reports:
            if report.heritage_resource_id in resources_dict:
                report.heritage_resource_name = resources_dict[report.heritage_resource_id].name

        response = {
            "items": reports,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }

        logger.info(f"Respuesta final: {response}")

        return response

    except Exception as e:
        logger.error(f"Error al buscar memorias: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar memorias: {str(e)}"
        )

@router.post("/reports/create", response_model=SustainabilityReport)
async def create_report_endpoint(
    report: SustainabilityReportCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva memoria de sostenibilidad.
    Permite la creación si el usuario es admin o si es gestor del recurso.
    """
    try:
        logger.info(f"Recibiendo datos de la memoria: {report.model_dump()}")
        
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report.heritage_resource_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        # Verificar si ya existe una memoria para el mismo recurso y año
        existing_report = db.query(SustainabilityReportModel).filter(
            SustainabilityReportModel.heritage_resource_id == report.heritage_resource_id,
            SustainabilityReportModel.year == report.year
        ).first()
        
        if existing_report:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe una memoria para el recurso {report.heritage_resource_id} en el año {report.year}"
            )
        
        db_report = reports_crud.create_report(db=db, report=report)
        logger.info(f"Memoria creada en la base de datos: {db_report}")
        
        # Obtener el recurso asociado
        resource = db.query(HeritageResource).filter(HeritageResource.id == db_report.heritage_resource_id).first()
        
        # Convertir el modelo a esquema Pydantic
        return SustainabilityReport(
            id=db_report.id,
            heritage_resource_id=db_report.heritage_resource_id,
            heritage_resource_name=resource.name if resource else None,
            year=db_report.year,
            state=db_report.state,
            observation=db_report.observation,
            cover_photo=db_report.cover_photo,
            commitment_letter=db_report.commitment_letter,
            mission=db_report.mission,
            vision=db_report.vision,
            values=db_report.values,
            org_chart_text=db_report.org_chart_text,
            org_chart_figure=db_report.org_chart_figure,
            diagnosis_description=db_report.diagnosis_description,
            scale=db_report.scale,
            permissions=db_report.permissions,
            action_plan_description=db_report.action_plan_description,
            internal_coherence_description=db_report.internal_coherence_description,
            main_impact_weight=db_report.main_impact_weight,
            secondary_impact_weight=db_report.secondary_impact_weight,
            roadmap_description=db_report.roadmap_description,
            data_tables_text=db_report.data_tables_text
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error al crear la memoria: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la memoria: {str(e)}"
        )

@router.post("/reports/update", response_model=SustainabilityReport)
async def update_report_endpoint(
    update_request: ReportUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una memoria de sostenibilidad existente.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    logger.info(f"Recibida petición de actualización: {update_request}")
    
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=update_request.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_report = reports_crud.update_report(
            db=db, 
            report_id=update_request.report_id, 
            report=update_request.report_data
        )
        if not db_report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )
        
        # Obtener el recurso asociado
        resource = db.query(HeritageResource).filter(HeritageResource.id == db_report.heritage_resource_id).first()
        
        # Convertir el modelo a esquema Pydantic
        return SustainabilityReport(
            id=db_report.id,
            heritage_resource_id=db_report.heritage_resource_id,
            heritage_resource_name=resource.name if resource else None,
            year=db_report.year,
            state=db_report.state,
            observation=db_report.observation,
            cover_photo=db_report.cover_photo,
            commitment_letter=db_report.commitment_letter,
            mission=db_report.mission,
            vision=db_report.vision,
            values=db_report.values,
            org_chart_text=db_report.org_chart_text,
            org_chart_figure=db_report.org_chart_figure,
            diagnosis_description=db_report.diagnosis_description,
            scale=db_report.scale,
            permissions=db_report.permissions,
            action_plan_description=db_report.action_plan_description,
            internal_coherence_description=db_report.internal_coherence_description,
            main_impact_weight=db_report.main_impact_weight,
            secondary_impact_weight=db_report.secondary_impact_weight,
            roadmap_description=db_report.roadmap_description,
            data_tables_text=db_report.data_tables_text
        )

    except Exception as e:
        logger.error(f"Error al actualizar la memoria: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la memoria: {str(e)}"
        )

@router.delete("/reports/delete/{report_id}")
async def delete_report_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una memoria de sostenibilidad.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        success = reports_crud.delete_report(db=db, report_id=report_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )
        return {"message": "Memoria eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la memoria: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la memoria: {str(e)}"
        )

@router.get("/reports/norms/{report_id}", response_model=List[ReportNorm])
async def get_report_norms_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las normativas de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin o si tiene un rol asignado en el reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe
        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todas las normativas del reporte
        norms = reports_crud.get_norms_by_report_id(db, report_id)
        return norms

    except Exception as e:
        logger.error(f"Error al obtener las normativas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las normativas: {str(e)}"
        )

@router.post("/reports/norms", response_model=ReportNorm)
async def create_norm_endpoint(
    norm: ReportNormCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva normativa para una memoria.
    Permite la creación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_norm = reports_crud.create_norm(db=db, norm=norm)
        return db_norm

    except Exception as e:
        logger.error(f"Error al crear la normativa: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la normativa: {str(e)}"
        )

@router.put("/reports/norms/{norm_id}", response_model=ReportNorm)
async def update_norm_endpoint(
    norm_id: int,
    norm: ReportNormUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una normativa existente.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_norm = reports_crud.get_norm_by_id(db, norm_id)
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        db_norm = reports_crud.update_norm(db, norm_id, norm)
        return db_norm

    except Exception as e:
        logger.error(f"Error al actualizar la normativa: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la normativa: {str(e)}"
        )

@router.delete("/reports/norms/{norm_id}")
async def delete_norm_endpoint(
    norm_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una normativa.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener la normativa para saber a qué reporte pertenece
        db_norm = db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        reports_crud.delete_norm(db, norm_id)
        return {"message": "Normativa eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la normativa: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la normativa: {str(e)}"
        )

@router.post("/reports/update/cover/{report_id}")
async def update_cover_photo(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar la foto de portada de una memoria.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria de sostenibilidad no encontrada")
        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Eliminar la foto anterior si existe
        if report.cover_photo:
            try:
                old_file_path = settings.BASE_DIR / report.cover_photo.lstrip('/')
                if old_file_path.exists():
                    old_file_path.unlink()
                    logger.info(f"Archivo anterior eliminado: {old_file_path}")
            except Exception as e:
                logger.error(f"Error al eliminar el archivo anterior: {str(e)}")
                # Continuamos con el proceso aunque falle la eliminación

        # Leer el contenido del archivo
        content = await file.read()
        
        file_url = reports_crud.update_cover_photo(db, report, content)

        return {"url": file_url}

    except Exception as e:
        logger.error(f"Error al actualizar la foto de portada: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/upload/logos/{report_id}", response_model=ReportLogoResponse)
async def upload_logo(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Subir un nuevo logo para una memoria.
    Permite la subida si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Leer el contenido del archivo
            content = await file.read()

        new_logo = reports_crud.upload_logo(db, report, content, file_extension)

        return ReportLogoResponse(
            id=new_logo.id,
            logo=new_logo.logo,
            report_id=new_logo.report_id
        )

    except Exception as e:
        logger.error(f"Error al subir el logo: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/logos/{report_id}", response_model=List[ReportLogoResponse])
async def get_report_logos(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los logos de una memoria como data URLs.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        logo_responses = reports_crud.get_report_logos(db, report_id)

        return logo_responses

    except Exception as e:
        logger.error(f"Error al obtener los logos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/delete/logo/{logo_id}")
async def delete_logo(
    logo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un logo de una memoria y su archivo físico asociado.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener el logo para saber a qué reporte pertenece
        logo = reports_crud.get_logo_by_id(db, logo_id)
        if not logo:
            raise HTTPException(status_code=404, detail="Logo no encontrado")

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=logo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        reports_crud.delete_logo(db, logo_id, logo)

        return {"message": "Logo eliminado correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar el logo: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get/cover/{report_id}")
async def get_cover_photo(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la imagen de portada de una memoria.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe y tiene foto de portada
        report = reports_crud.get_report(db, report_id)
        if not report or not report.cover_photo:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")

        # La ruta en la base de datos es relativa (/static/uploads/covers/filename)
        # Necesitamos convertirla a ruta absoluta
        relative_path = report.cover_photo.lstrip('/')  # Eliminar el primer '/'
        file_path = settings.BASE_DIR / relative_path

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        return FileResponse(
            file_path,
            media_type="image/jpeg",  # Ajustaremos el tipo según la extensión
            filename=file_path.name
        )

    except Exception as e:
        logger.error(f"Error al obtener la foto de portada: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/agreements/{report_id}", response_model=List[ReportAgreement])
async def get_report_agreements_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los acuerdos de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe
        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todos los acuerdos del reporte
        agreements = reports_crud.get_report_agreements(db, report_id)
        return agreements

    except Exception as e:
        logger.error(f"Error al obtener los acuerdos: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los acuerdos: {str(e)}"
        )

@router.post("/reports/agreements", response_model=ReportAgreement)
async def create_agreement_endpoint(
    agreement: ReportAgreementCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo acuerdo para una memoria.
    Permite la creación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_agreement = reports_crud.create_agreement(db, agreement)
        return db_agreement

    except Exception as e:
        logger.error(f"Error al crear el acuerdo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el acuerdo: {str(e)}"
        )

@router.put("/reports/agreements/{agreement_id}", response_model=ReportAgreement)
async def update_agreement_endpoint(
    agreement_id: int,
    agreement: ReportAgreementUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un acuerdo existente.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_agreement = reports_crud.get_agreement_by_id(db, agreement_id)
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        db_agreement = reports_crud.update_agreement(db, agreement_id, agreement)
        return db_agreement

    except Exception as e:
        logger.error(f"Error al actualizar el acuerdo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el acuerdo: {str(e)}"
        )

@router.delete("/reports/agreements/{agreement_id}")
async def delete_agreement_endpoint(
    agreement_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un acuerdo.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener el acuerdo para saber a qué reporte pertenece
        db_agreement = reports_crud.get_agreement_by_id(db, agreement_id)
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        reports_crud.delete_agreement(db, agreement_id, db_agreement)
        return {"message": "Acuerdo eliminado correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar el acuerdo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el acuerdo: {str(e)}"
        )

@router.post("/reports/bibliographies", response_model=ReportBibliography)
async def create_bibliography_endpoint(
    bibliography: ReportBibliographyCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva bibliografía para una memoria.
    Permite la creación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_bibliography = reports_crud.create_bibliography(db, bibliography)
        return db_bibliography

    except Exception as e:
        logger.error(f"Error al crear la bibliografía: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la bibliografía: {str(e)}"
        )

@router.put("/reports/bibliographies/{bibliography_id}", response_model=ReportBibliography)
async def update_bibliography_endpoint(
    bibliography_id: int,
    bibliography: ReportBibliographyUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una bibliografía existente.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_bibliography = reports_crud.get_bibliography_by_id(db, bibliography_id)
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Bibliografía no encontrada"
            )

        db_bibliography = reports_crud.update_bibliography(db, bibliography_id, bibliography)
        return db_bibliography

    except Exception as e:
        logger.error(f"Error al actualizar la bibliografía: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la bibliografía: {str(e)}"
        )

@router.delete("/reports/bibliographies/{bibliography_id}")
async def delete_bibliography_endpoint(
    bibliography_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una bibliografía.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener la bibliografía para saber a qué reporte pertenece
        db_bibliography = db.query(ReportBibliographyModel).filter(ReportBibliographyModel.id == bibliography_id).first()
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Bibliografía no encontrada"
            )

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        reports_crud.delete_bibliography(db, bibliography_id, db_bibliography)
        return {"message": "Bibliografía eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la bibliografía: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la bibliografía: {str(e)}"
        )

@router.get("/reports/bibliographies/{report_id}", response_model=List[ReportBibliography])
async def get_report_bibliographies_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las referencias bibliográficas de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todas las referencias bibliográficas del reporte
        bibliographies = reports_crud.get_report_bibliographies(db, report_id)
        return bibliographies

    except Exception as e:
        logger.error(f"Error al obtener las referencias bibliográficas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las referencias bibliográficas: {str(e)}"
        )

@router.post("/reports/update/organization-chart/{report_id}")
async def update_organization_chart(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar el organigrama de una memoria.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria de sostenibilidad no encontrada")
        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Eliminar el organigrama anterior si existe
        if report.org_chart_figure:
            try:
                old_file_path = settings.BASE_DIR / report.org_chart_figure.lstrip('/')
                if old_file_path.exists():
                    old_file_path.unlink()
                    logger.info(f"Archivo anterior eliminado: {old_file_path}")
            except Exception as e:
                logger.error(f"Error al eliminar el archivo anterior: {str(e)}")
                # Continuamos con el proceso aunque falle la eliminación

        # Leer el contenido del archivo
            content = await file.read()

        file_url = reports_crud.update_organization_chart(db, report, content)

        return {"url": file_url}

    except Exception as e:
        logger.error(f"Error al actualizar el organigrama: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/upload/photos/{report_id}", response_model=ReportPhotoResponse)
async def upload_photo(
    report_id: int,
    file: UploadFile = File(...),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Subir una nueva foto para una memoria.
    Permite la subida si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe
        report = reports_crud.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        # Leer el contenido del archivo
        content = await file.read()

        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        new_photo = reports_crud.upload_photo(db, report, content, file_extension, description)

        return ReportPhotoResponse(
            id=new_photo.id,
            photo=new_photo.photo,
            description=new_photo.description,
            report_id=new_photo.report_id
        )

    except Exception as e:
        logger.error(f"Error al subir la foto: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/photos/{report_id}", response_model=List[ReportPhotoResponse])
async def get_report_photos(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las fotos de una memoria.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        photo_responses = reports_crud.get_report_photos(db, report_id)

        return photo_responses

    except Exception as e:
        logger.error(f"Error al obtener las fotos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/delete/photo/{photo_id}")
async def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una foto de una memoria y su archivo físico asociado.
    Permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener la foto para saber a qué reporte pertenece
        photo = reports_crud.get_photo_by_id(db, photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=photo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        reports_crud.delete_photo(db, photo_id, photo)

        return {"message": "Foto eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la foto: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/reports/update/photo/{photo_id}", response_model=ReportPhotoResponse)
async def update_photo(
    photo_id: int,
    photo_update: ReportPhotoUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar la descripción de una foto.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Primero obtener la foto para saber a qué reporte pertenece
        photo = reports_crud.get_photo_by_id(db, photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=photo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        photo = reports_crud.update_photo(db, photo_id, photo_update)

        return ReportPhotoResponse(
            id=photo.id,
            photo=photo.photo,
            description=photo.description,
            report_id=photo.report_id
            )

    except Exception as e:
        logger.error(f"Error al actualizar la foto: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}/user-role", response_model=UserRoleResponse)
def get_user_role(
    report_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el rol del usuario actual en el reporte especificado.
    """
    # Verificar si el usuario es admin
    if current_user.admin:
        return {"role": "manager"}

    # Obtener el rol del usuario en el reporte
    team_member = reports_crud.get_team_member(db, current_user.id, report_id)

    if not team_member:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un rol asignado para este usuario en el reporte"
        )

    return {"role": team_member.type}

@router.get("/reports/get/organization-chart/{report_id}")
async def get_organization_chart(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la imagen del organigrama de una memoria.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Verificar que el reporte existe y tiene organigrama
        report = reports_crud.get_report(db, report_id)
        if not report or not report.org_chart_figure:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")

        # La ruta en la base de datos es relativa (/static/uploads/organization_charts/filename)
        # Necesitamos convertirla a ruta absoluta
        relative_path = report.org_chart_figure.lstrip('/')
        file_path = settings.BASE_DIR / relative_path

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        # Determinar el tipo MIME basado en la extensión del archivo
        file_extension = file_path.suffix.lower()
        mime_type = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }.get(file_extension, 'image/jpeg')

        return FileResponse(
            file_path,
            media_type=mime_type,
            filename=file_path.name
        )

    except Exception as e:
        logger.error(f"Error al obtener el organigrama: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
