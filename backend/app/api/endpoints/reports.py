from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.api.deps import get_db, get_current_user
from app.crud import reports as reports_crud
from app.crud import resources as resources_crud
from app.schemas.reports import SustainabilityReport, SustainabilityReportCreate, SustainabilityReportUpdate
from app.schemas.auth import TokenData
from app.models.models import SustainabilityReport as SustainabilityReportModel, HeritageResource
import logging

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/reports/search", response_model=dict)
async def search_reports_endpoint(
    search_params: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar memorias de sostenibilidad con filtros opcionales.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

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
                heritage_resource_ids=resource_ids,
                skip=(page - 1) * per_page,
                limit=per_page
            )
        
        # Caso 4: Sin filtros, devolver todas las memorias
        else:
            logger.info("No se proporcionaron filtros de búsqueda, devolviendo todas las memorias")
            reports, total = reports_crud.search_reports(
                db=db,
                skip=(page - 1) * per_page,
                limit=per_page
            )

        logger.info(f"Memorias encontradas: {len(reports)}")

        # Obtener los recursos asociados a las memorias
        resource_ids = [report.heritage_resource_id for report in reports]
        resources = db.query(HeritageResource).filter(HeritageResource.id.in_(resource_ids)).all()
        
        # Crear un diccionario para acceder rápidamente a los recursos por ID
        resources_dict = {resource.id: resource for resource in resources}

        # Convertir los reportes a esquema Pydantic
        reports_schema = [
            SustainabilityReport(
                id=report.id,
                heritage_resource_id=report.heritage_resource_id,
                heritage_resource_name=resources_dict.get(report.heritage_resource_id).name if report.heritage_resource_id in resources_dict else None,
                year=report.year,
                state=report.state,
                observation=report.observation,
                cover_photo=report.cover_photo,
                commitment_letter=report.commitment_letter,
                mission=report.mission,
                vision=report.vision,
                values=report.values,
                org_chart_text=report.org_chart_text,
                org_chart_figure=report.org_chart_figure,
                diagnosis_description=report.diagnosis_description,
                scale=report.scale,
                permissions=report.permissions,
                action_plan_description=report.action_plan_description,
                internal_coherence_description=report.internal_coherence_description,
                main_impact_weight=report.main_impact_weight,
                secondary_impact_weight=report.secondary_impact_weight,
                roadmap_description=report.roadmap_description,
                data_tables_text=report.data_tables_text
            )
            for report in reports
        ]

        response = {
            "items": reports_schema,
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear memorias"
        )

    try:
        logger.info(f"Recibiendo datos de la memoria: {report.model_dump()}")
        
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
    report_id: int = Body(...),
    report_data: SustainabilityReportUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una memoria de sostenibilidad existente.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar memorias"
        )

    try:
        db_report = reports_crud.update_report(db=db, report_id=report_id, report=report_data)
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar memorias"
        )

    try:
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
