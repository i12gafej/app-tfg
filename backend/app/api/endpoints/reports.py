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
    ReportPhotoUpdate
)
from app.schemas.auth import TokenData
from app.models.models import SustainabilityReport as SustainabilityReportModel, HeritageResource, ReportNorm as ReportNormModel, ReportLogo as ReportLogoModel, ReportAgreement as ReportAgreementModel, ReportBibliography as ReportBibliographyModel, ReportPhoto as ReportPhotoModel
import logging
from PIL import Image
import io

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar rutas de archivos
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
COVERS_DIR = UPLOADS_DIR / "covers"
LOGOS_DIR = UPLOADS_DIR / "logos"
PHOTOS_DIR = UPLOADS_DIR / "gallery"

# Crear directorios si no existen
COVERS_DIR.mkdir(parents=True, exist_ok=True)
LOGOS_DIR.mkdir(parents=True, exist_ok=True)
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

# Constantes para el procesamiento de imágenes
A4_RATIO = 1.4142  # Ratio de A4 (297mm/210mm)
A4_WIDTH = 2480    # Ancho en píxeles para 300 DPI
A4_HEIGHT = 3508   # Alto en píxeles para 300 DPI

def process_cover_image(image_data: bytes) -> bytes:
    """
    Procesa la imagen de portada para ajustarla al formato A4.
    El proceso mantiene el centro de la imagen y recorta los excesos para mantener el ratio A4.
    """
    try:
        # Abrir la imagen desde los bytes
        img = Image.open(io.BytesIO(image_data))
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Obtener dimensiones actuales
        width, height = img.size
        current_ratio = height / width
        
        if current_ratio < A4_RATIO:
            # La imagen es más ancha que el ratio A4
            # Calculamos el nuevo ancho necesario manteniendo el alto actual
            new_width = int(height / A4_RATIO)
            # Calculamos los puntos de recorte desde el centro
            left = (width - new_width) // 2
            right = left + new_width
            # Recortamos la imagen manteniendo el alto completo
            img = img.crop((left, 0, right, height))
        else:
            # La imagen es más alta que el ratio A4
            # Calculamos el nuevo alto necesario manteniendo el ancho actual
            new_height = int(width * A4_RATIO)
            # Calculamos los puntos de recorte desde el centro
            top = (height - new_height) // 2
            bottom = top + new_height
            # Recortamos la imagen manteniendo el ancho completo
            img = img.crop((0, top, width, bottom))
        
        # Redimensionar a las dimensiones A4 finales
        img = img.resize((A4_WIDTH, A4_HEIGHT), Image.Resampling.LANCZOS)
        
        # Guardar la imagen procesada en bytes
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=95)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Error al procesar la imagen: {str(e)}")
        raise

router = APIRouter()

@router.get("/reports/get/{report_id}", response_model=SustainabilityReport)
async def get_report_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener una memoria de sostenibilidad por su ID.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a esta memoria"
        )

    try:
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
    update_request: ReportUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una memoria de sostenibilidad existente.
    """
    logger.info(f"Recibida petición de actualización: {update_request}")
    
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar memorias"
        )

    try:
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

@router.post("/reports/norms", response_model=ReportNorm)
async def create_norm_endpoint(
    norm: ReportNormCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva normativa para una memoria.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear normativas"
        )

    try:
        db_norm = ReportNormModel(**norm.dict())
        db.add(db_norm)
        db.commit()
        db.refresh(db_norm)
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar normativas"
        )

    try:
        db_norm = db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        for key, value in norm.dict().items():
            setattr(db_norm, key, value)

        db.commit()
        db.refresh(db_norm)
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar normativas"
        )

    try:
        db_norm = db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        db.delete(db_norm)
        db.commit()
        return {"message": "Normativa eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la normativa: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la normativa: {str(e)}"
        )

@router.get("/reports/norms/{report_id}", response_model=List[ReportNorm])
async def get_report_norms_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las normativas de una memoria de sostenibilidad.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a las normativas"
        )

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todas las normativas del reporte
        norms = db.query(ReportNormModel).filter(ReportNormModel.report_id == report_id).all()
        return norms

    except Exception as e:
        logger.error(f"Error al obtener las normativas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las normativas: {str(e)}"
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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Eliminar la foto anterior si existe
        if report.cover_photo:
            try:
                old_file_path = BASE_DIR / report.cover_photo.lstrip('/')
                if old_file_path.exists():
                    old_file_path.unlink()
                    logger.info(f"Archivo anterior eliminado: {old_file_path}")
            except Exception as e:
                logger.error(f"Error al eliminar el archivo anterior: {str(e)}")
                # Continuamos con el proceso aunque falle la eliminación

        # Leer el contenido del archivo
        content = await file.read()
        
        # Procesar la imagen
        processed_image = process_cover_image(content)

        # Crear nombre único para el archivo
        filename = f"report_{report_id}_cover_{uuid.uuid4()}.jpg"  # Siempre guardamos como JPG
        file_path = COVERS_DIR / filename

        logger.info(f"Guardando archivo procesado en: {file_path}")

        # Guardar el archivo procesado
        with open(file_path, "wb") as file_object:
            file_object.write(processed_image)

        # Actualizar la URL en la base de datos
        file_url = f"/static/uploads/covers/{filename}"
        report.cover_photo = file_url
        db.commit()

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Crear nombre único para el archivo
        filename = f"report_{report_id}_logo_{uuid.uuid4()}{file_extension}"
        file_path = LOGOS_DIR / filename

        logger.info(f"Guardando logo en: {file_path}")

        # Guardar el archivo
        with open(file_path, "wb+") as file_object:
            content = await file.read()
            file_object.write(content)

        # Crear registro en la base de datos (usando ruta relativa para la URL)
        file_url = f"/static/uploads/logos/{filename}"
        new_logo = ReportLogoModel(
            logo=file_url,
            report_id=report_id
        )
        db.add(new_logo)
        db.commit()
        db.refresh(new_logo)

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        logos = db.query(ReportLogoModel).filter(ReportLogoModel.report_id == report_id).all()
        logo_responses = []

        for logo in logos:
            try:
                # Convertir la ruta relativa a absoluta
                relative_path = logo.logo.lstrip('/')
                file_path = BASE_DIR / relative_path

                if not file_path.exists():
                    logger.warning(f"Archivo de logo no encontrado: {file_path}")
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
                logger.error(f"Error al procesar el logo {logo.id}: {str(e)}")
                continue

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        logo = db.query(ReportLogoModel).filter(ReportLogoModel.id == logo_id).first()
        if not logo:
            raise HTTPException(status_code=404, detail="Logo no encontrado")

        # Convertir la ruta relativa a absoluta
        relative_path = logo.logo.lstrip('/')
        file_path = BASE_DIR / relative_path

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        # Verificar que el reporte existe y tiene foto de portada
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report or not report.cover_photo:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")

        # La ruta en la base de datos es relativa (/static/uploads/covers/filename)
        # Necesitamos convertirla a ruta absoluta
        relative_path = report.cover_photo.lstrip('/')  # Eliminar el primer '/'
        file_path = BASE_DIR / relative_path

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

@router.post("/reports/agreements", response_model=ReportAgreement)
async def create_agreement_endpoint(
    agreement: ReportAgreementCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo acuerdo para una memoria.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear acuerdos"
        )

    try:
        db_agreement = ReportAgreementModel(**agreement.dict())
        db.add(db_agreement)
        db.commit()
        db.refresh(db_agreement)
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar acuerdos"
        )

    try:
        db_agreement = db.query(ReportAgreementModel).filter(ReportAgreementModel.id == agreement_id).first()
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        for key, value in agreement.dict().items():
            setattr(db_agreement, key, value)

        db.commit()
        db.refresh(db_agreement)
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
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar acuerdos"
        )

    try:
        db_agreement = db.query(ReportAgreementModel).filter(ReportAgreementModel.id == agreement_id).first()
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        db.delete(db_agreement)
        db.commit()
        return {"message": "Acuerdo eliminado correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar el acuerdo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el acuerdo: {str(e)}"
        )

@router.get("/reports/agreements/{report_id}", response_model=List[ReportAgreement])
async def get_report_agreements_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los acuerdos de una memoria de sostenibilidad.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a los acuerdos"
        )

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todos los acuerdos del reporte
        agreements = db.query(ReportAgreementModel).filter(ReportAgreementModel.report_id == report_id).all()
        return agreements

    except Exception as e:
        logger.error(f"Error al obtener los acuerdos: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los acuerdos: {str(e)}"
        )

@router.post("/reports/bibliographies", response_model=ReportBibliography)
async def create_bibliography_endpoint(
    bibliography: ReportBibliographyCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva referencia bibliográfica para una memoria.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear referencias bibliográficas"
        )

    try:
        db_bibliography = ReportBibliographyModel(**bibliography.dict())
        db.add(db_bibliography)
        db.commit()
        db.refresh(db_bibliography)
        return db_bibliography

    except Exception as e:
        logger.error(f"Error al crear la referencia bibliográfica: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la referencia bibliográfica: {str(e)}"
        )

@router.put("/reports/bibliographies/{bibliography_id}", response_model=ReportBibliography)
async def update_bibliography_endpoint(
    bibliography_id: int,
    bibliography: ReportBibliographyUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una referencia bibliográfica existente.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar referencias bibliográficas"
        )

    try:
        db_bibliography = db.query(ReportBibliographyModel).filter(ReportBibliographyModel.id == bibliography_id).first()
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Referencia bibliográfica no encontrada"
            )

        for key, value in bibliography.dict().items():
            setattr(db_bibliography, key, value)

        db.commit()
        db.refresh(db_bibliography)
        return db_bibliography

    except Exception as e:
        logger.error(f"Error al actualizar la referencia bibliográfica: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la referencia bibliográfica: {str(e)}"
        )

@router.delete("/reports/bibliographies/{bibliography_id}")
async def delete_bibliography_endpoint(
    bibliography_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una referencia bibliográfica.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar referencias bibliográficas"
        )

    try:
        db_bibliography = db.query(ReportBibliographyModel).filter(ReportBibliographyModel.id == bibliography_id).first()
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Referencia bibliográfica no encontrada"
            )

        db.delete(db_bibliography)
        db.commit()
        return {"message": "Referencia bibliográfica eliminada correctamente"}

    except Exception as e:
        logger.error(f"Error al eliminar la referencia bibliográfica: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la referencia bibliográfica: {str(e)}"
        )

@router.get("/reports/bibliographies/{report_id}", response_model=List[ReportBibliography])
async def get_report_bibliographies_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las referencias bibliográficas de una memoria de sostenibilidad.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a las referencias bibliográficas"
        )

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        # Obtener todas las referencias bibliográficas del reporte
        bibliographies = db.query(ReportBibliographyModel).filter(ReportBibliographyModel.report_id == report_id).all()
        return bibliographies

    except Exception as e:
        logger.error(f"Error al obtener las referencias bibliográficas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las referencias bibliográficas: {str(e)}"
        )

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        # Verificar que el reporte existe
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        # Verificar extensión del archivo
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        # Crear nombre único para el archivo
        filename = f"report_{report_id}_photo_{uuid.uuid4()}{file_extension}"
        file_path = PHOTOS_DIR / filename

        logger.info(f"Guardando foto en: {file_path}")

        # Guardar el archivo
        with open(file_path, "wb+") as file_object:
            content = await file.read()
            file_object.write(content)

        # Crear registro en la base de datos
        file_url = f"/static/uploads/gallery/{filename}"
        new_photo = ReportPhotoModel(
            photo=file_url,
            description=description,
            report_id=report_id
        )
        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        photos = db.query(ReportPhotoModel).filter(ReportPhotoModel.report_id == report_id).all()
        photo_responses = []

        for photo in photos:
            try:
                # Convertir la ruta relativa a absoluta
                relative_path = photo.photo.lstrip('/')
                file_path = BASE_DIR / relative_path

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        photo = db.query(ReportPhotoModel).filter(ReportPhotoModel.id == photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        # Convertir la ruta relativa a absoluta
        relative_path = photo.photo.lstrip('/')
        file_path = BASE_DIR / relative_path

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
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    try:
        photo = db.query(ReportPhotoModel).filter(ReportPhotoModel.id == photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        # Actualizar la descripción
        photo.description = photo_update.description

        db.commit()
        db.refresh(photo)

        # Convertir la ruta relativa a absoluta para obtener la imagen
        relative_path = photo.photo.lstrip('/')
        file_path = BASE_DIR / relative_path

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

            return ReportPhotoResponse(
                id=photo.id,
                photo=data_url,
                description=photo.description,
                report_id=photo.report_id
            )

    except Exception as e:
        logger.error(f"Error al actualizar la foto: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
