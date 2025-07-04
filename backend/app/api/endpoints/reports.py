from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
import os
import uuid
from pathlib import Path
from app.api.deps import get_db, get_current_user
from app.crud import reports as crud_reports
from app.crud import resources as crud_resources
from app.schemas.reports import (
    SustainabilityReport, 
    SustainabilityReportCreate, 
    SustainabilityReportUpdate, 
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
    ReportSearch
)
from app.schemas.auth import TokenData
from app.models.models import SustainabilityReport as SustainabilityReportModel, HeritageResource as HeritageResourceModel, ReportNorm as ReportNormModel, ReportLogo as ReportLogoModel, ReportAgreement as ReportAgreementModel, ReportBibliography as ReportBibliographyModel, ReportPhoto as ReportPhotoModel, SustainabilityTeamMember
from app.services.user import check_user_permissions
import logging
from PIL import Image
from app.config import Settings
import io

settings = Settings()

router = APIRouter()

@router.get("/reports/get/{report_id}", response_model=SustainabilityReport)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener una memoria de sostenibilidad por su ID.
    Permite el acceso si el usuario es admin o si tiene un rol asignado en la memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = crud_reports.get_report(db=db, report_id=report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )
        return report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener la memoria: {str(e)}"
        )

@router.get("/reports/get-all/templates/", response_model=dict)
def get_all_report_templates(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las memorias plantilla
    """
    try:        
        result = crud_reports.get_all_report_templates(db)
        
        
        resources_schema = [
            {
                "resource_id": item[0],
                "resource_name": item[1],
                "year": item[2],
                "report_id": item[3]
            } for item in result
        ]
        
        return { "items": resources_schema }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        

@router.post("/reports/search", response_model=dict)
async def search_reports(
    search_params: ReportSearch,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar memorias de sostenibilidad con filtros opcionales.
    """
    try:
        
        search_term = search_params.search_term
        heritage_resource_name = search_params.heritage_resource_name
        year = search_params.year
        state = search_params.state

        
        if heritage_resource_name:
            
            resources = crud_resources.search(
                db=db,
                name=heritage_resource_name
            )
            
            if not resources:
                return {
                    "items": [],
                    "total": 0
                }
            
            
            resource_ids = [r.id for r in resources]
            
            
            reports = crud_reports.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                heritage_resource_ids=resource_ids,
                year=year,
                state=state
            )
        
        
        elif year or state:
            reports = crud_reports.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                year=year,
                state=state
            )
        
        
        elif search_term:
            
            resources = crud_resources.search(
                db=db,
                name=search_term
            )
            
            
            resource_ids = [r.id for r in resources]
            
            
            reports = crud_reports.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin,
                heritage_resource_ids=resource_ids
            )
        
        
        else:
            reports = crud_reports.search_reports(
                db=db,
                user_id=current_user.id if not current_user.admin else None,
                is_admin=current_user.admin
            )

        
        resource_ids = [report.heritage_resource_id for report in reports]
        resources = crud_resources.get_all_by_resources_ids(db, resource_ids)
        
        
        resources_dict = {resource.id: resource for resource in resources}

        
        for report in reports:
            if report.heritage_resource_id in resources_dict:
                report.heritage_resource_name = resources_dict[report.heritage_resource_id].name

        total = len(reports)

        return {
            "items": reports,
            "total": total
        }   

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar memorias: {str(e)}"
        )

@router.post("/public-reports/search", response_model=dict)
async def search_public_reports(
    search_params: ReportSearch = Body(...),
    db: Session = Depends(get_db)
):
    """
    Buscar memorias de sostenibilidad públicas con filtros opcionales.
    """
    try:
        
        search_term = search_params.search_term
        heritage_resource_name = search_params.heritage_resource_name
        year = search_params.year

        
        if heritage_resource_name:
            resources = crud_resources.search(
                db=db,
                name=heritage_resource_name
            )
            
            if not resources:
                return {
                    "items": [],
                    "total": 0
                }
            
            
            resource_ids = [r.id for r in resources]

            
            reports = crud_reports.search_reports(
                db=db,
                heritage_resource_ids=resource_ids,
                state="Published"
            )
        
        
        elif year:
            reports = crud_reports.search_reports(
                db=db,
                year=year,
                state="Published"
            )
        
        
        elif search_term:
            resources = crud_resources.search(
                db=db,
                name=search_term
            )
            
            resource_ids = [r.id for r in resources]

            
            reports = crud_reports.search_reports(
                db=db,
                heritage_resource_ids=resource_ids,
                state="Published"
            )
        
        
        else:
            reports = crud_reports.search_reports(
                db=db,
                state="Published"
            )

        
        resource_ids = [report.heritage_resource_id for report in reports]
        resources = crud_resources.get_all_by_resources_ids(db, resource_ids)

        
        resources_dict = {resource.id: resource for resource in resources}

        
        items = []
        for report in reports:
            if report.heritage_resource_id in resources_dict:
                resource = resources_dict[report.heritage_resource_id]
                items.append({
                    "resource_id": report.heritage_resource_id,
                    "resource_name": resource.name,
                    "year": report.year,
                    "report_id": report.id
                })

        return {
            "items": items,
            "total": len(items)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar memorias públicas: {str(e)}"
        )
        

@router.post("/reports/create", response_model=SustainabilityReport)
async def create_report(
    report: SustainabilityReportCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva memoria de sostenibilidad.
    Permite la creación si el usuario es admin o si es gestor del recurso.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report.heritage_resource_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        
        existing_report = db.query(SustainabilityReportModel).filter(
            SustainabilityReportModel.heritage_resource_id == report.heritage_resource_id,
            SustainabilityReportModel.year == report.year
        ).first()
        
        if existing_report:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe una memoria para el recurso {report.heritage_resource_id} en el año {report.year}"
            )
        
        db_report = crud_reports.create_report(db=db, report=report)
        
        resource = db.query(HeritageResourceModel).filter(HeritageResourceModel.id == db_report.heritage_resource_id).first()
        
        
        report_dict = db_report.__dict__.copy()
        if resource:
            report_dict['heritage_resource_name'] = resource.name
        return SustainabilityReport.model_validate(report_dict, from_attributes=True)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la memoria: {str(e)}"
        )

@router.put("/reports/update/{report_id}", response_model=SustainabilityReport)
async def update_report(
    report_id: int,
    update_request: SustainabilityReportUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una memoria de sostenibilidad existente.
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_report = crud_reports.update_report(
            db=db, 
            report_id=report_id, 
            report=update_request
        )
        if not db_report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        
        resource = db.query(HeritageResourceModel).filter(HeritageResourceModel.id == db_report.heritage_resource_id).first()
        if resource:
            db_report.heritage_resource_name = resource.name

        
        return SustainabilityReport.model_validate(db_report, from_attributes=True)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la memoria: {str(e)}"
        )

@router.delete("/reports/delete/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una memoria de sostenibilidad.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        success = crud_reports.delete_report(db=db, report_id=report_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )
        return {"message": "Memoria eliminada correctamente"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la memoria: {str(e)}"
        )

@router.get("/reports/generate-preview/{report_id}")
async def generate_preview(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generar un preview de una memoria de sostenibilidad.
    """
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id,
            require_manager=True
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)
        
    try: 
        url = crud_reports.generate_report_html(db, report_id)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/publish/{report_id}")
async def publish_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Publicar una memoria de sostenibilidad.
    Permite la publicación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if report:
            report.state = 'Published'
            db.commit()

        
        report_url = crud_reports.generate_report_html(db, report_id)

        return {"message": "Memoria publicada correctamente", "url": report_url}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/norms/{report_id}", response_model=List[ReportNorm])
async def get_all_report_norms(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las normativas de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin o si tiene un rol asignado en la memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        
        norms = crud_reports.get_all_norms_by_report_id(db, report_id)
        return norms

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las normativas: {str(e)}"
        )

@router.post("/reports/norms", response_model=ReportNorm)
async def create_norm(
    norm: ReportNormCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva normativa para una memoria.
    Permite la creación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_norm = crud_reports.create_norm(db=db, norm=norm)
        return db_norm

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la normativa: {str(e)}"
        )

@router.put("/reports/update/norm/{norm_id}", response_model=ReportNorm)
async def update_norm(
    norm_id: int,
    norm: ReportNormUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una normativa existente.
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_norm = crud_reports.get_norm_by_id(db, norm_id)
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        db_norm = crud_reports.update_norm(db, norm_id, norm)
        return db_norm

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la normativa: {str(e)}"
        )

@router.delete("/reports/delete/norm/{norm_id}")
async def delete_norm(
    norm_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una normativa.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        db_norm = db.query(ReportNormModel).filter(ReportNormModel.id == norm_id).first()
        if not db_norm:
            raise HTTPException(
                status_code=404,
                detail="Normativa no encontrada"
            )

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_norm.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_reports.delete_norm(db, norm_id)
        return {"message": "Normativa eliminada correctamente"}

    except Exception as e:
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
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria de sostenibilidad no encontrada")
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        
        if report.cover_photo:
            try:
                old_file_path = settings.BASE_DIR / report.cover_photo.lstrip('/')
                if old_file_path.exists():
                    old_file_path.unlink()
            except Exception as e:
                pass
                

        
        content = await file.read()
        
        file_url = crud_reports.update_cover_photo(db, report, content)

        return {"url": file_url}

    except Exception as e:
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
    Permite la subida si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        
        content = await file.read()

        new_logo = crud_reports.upload_logo(db, report, content, file_extension)

        return ReportLogoResponse(
            id=new_logo.id,
            logo=new_logo.logo,
            report_id=new_logo.report_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/logos/{report_id}", response_model=List[ReportLogoResponse])
async def get_all_report_logos(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los logos de una memoria como data URLs.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        logos = crud_reports.get_all_report_logos(db, report_id)

        return logos

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/delete/logo/{logo_id}")
async def delete_logo(
    logo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un logo de una memoria y su archivo físico asociado.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        logo = crud_reports.get_logo_by_id(db, logo_id)
        if not logo:
            raise HTTPException(status_code=404, detail="Logo no encontrado")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=logo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_reports.delete_logo(db, logo_id, logo)

        return {"message": "Logo eliminado correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get/cover/{report_id}")
async def get_cover_photo(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la imagen de portada de una memoria.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        
        report = crud_reports.get_report(db, report_id)
        if not report or not report.cover_photo:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")

        
        
        relative_path = report.cover_photo.lstrip('/')  
        file_path = settings.BASE_DIR / relative_path

        

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        response = FileResponse(
            file_path,
            media_type="image/jpeg",  
            filename=file_path.name
        )
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/agreements/{report_id}", response_model=List[ReportAgreement])
async def get_all_report_agreements(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los acuerdos de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        
        agreements = crud_reports.get_all_report_agreements(db, report_id)
        return agreements

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los acuerdos: {str(e)}"
        )

@router.post("/reports/create/agreements", response_model=ReportAgreement)
async def create_agreement(
    agreement: ReportAgreementCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo acuerdo para una memoria.
    Permite la creación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_agreement = crud_reports.create_agreement(db, agreement)
        return ReportAgreement.model_validate(db_agreement, from_attributes=True)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el acuerdo: {str(e)}"
        )

@router.put("/reports/update/agreements/{agreement_id}", response_model=ReportAgreement)
async def update_agreement(
    agreement_id: int,
    agreement: ReportAgreementUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un acuerdo existente.
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_agreement = crud_reports.get_agreement_by_id(db, agreement_id)
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        db_agreement = crud_reports.update_agreement(db, agreement_id, agreement)
        return db_agreement

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el acuerdo: {str(e)}"
        )

@router.delete("/reports/delete/agreements/{agreement_id}")
async def delete_agreement(
    agreement_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un acuerdo.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        db_agreement = crud_reports.get_agreement_by_id(db, agreement_id)
        if not db_agreement:
            raise HTTPException(
                status_code=404,
                detail="Acuerdo no encontrado"
            )

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_agreement.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_reports.delete_agreement(db, agreement_id, db_agreement)
        return {"message": "Acuerdo eliminado correctamente"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el acuerdo: {str(e)}"
        )

@router.post("/reports/create/bibliographies", response_model=ReportBibliography)
async def create_bibliography(
    bibliography: ReportBibliographyCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva bibliografía para una memoria.
    Permite la creación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_bibliography = crud_reports.create_bibliography(db, bibliography)
        return db_bibliography

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear la bibliografía: {str(e)}"
        )

@router.put("/reports/update/bibliographies/{bibliography_id}", response_model=ReportBibliography)
async def update_bibliography(
    bibliography_id: int,
    bibliography: ReportBibliographyUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una bibliografía existente.
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        db_bibliography = crud_reports.get_bibliography_by_id(db, bibliography_id)
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Bibliografía no encontrada"
            )

        db_bibliography = crud_reports.update_bibliography(db, bibliography_id, bibliography)
        return db_bibliography

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar la bibliografía: {str(e)}"
        )

@router.delete("/reports/delete/bibliographies/{bibliography_id}")
async def delete_bibliography(
    bibliography_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una bibliografía.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        db_bibliography = db.query(ReportBibliographyModel).filter(ReportBibliographyModel.id == bibliography_id).first()
        if not db_bibliography:
            raise HTTPException(
                status_code=404,
                detail="Bibliografía no encontrada"
            )

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=db_bibliography.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_reports.delete_bibliography(db, bibliography_id, db_bibliography)
        return {"message": "Bibliografía eliminada correctamente"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar la bibliografía: {str(e)}"
        )

@router.get("/reports/get-all/bibliographies/{report_id}", response_model=List[ReportBibliography])
async def get_all_report_bibliographies(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las referencias bibliográficas de una memoria de sostenibilidad.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        
        report = db.query(SustainabilityReportModel).filter(SustainabilityReportModel.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        
        bibliographies = crud_reports.get_all_report_bibliographies(db, report_id)
        return bibliographies

    except Exception as e:
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
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria de sostenibilidad no encontrada")
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        
        if report.org_chart_figure:
            try:
                old_file_path = settings.BASE_DIR / report.org_chart_figure.lstrip('/')
                if old_file_path.exists():
                    old_file_path.unlink()
            except Exception as e:
                pass 

        content = await file.read()

        file_url = crud_reports.update_organization_chart(db, report, content)

        return {"url": file_url}

    except Exception as e:
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
    Permite la subida si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Memoria no encontrada")

        
        content = await file.read()

        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Formato de archivo no permitido")

        new_photo = crud_reports.upload_photo(db, report, content, file_extension, description)

        return ReportPhotoResponse(
            id=new_photo.id,
            photo=new_photo.photo,
            description=new_photo.description,
            report_id=new_photo.report_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get-all/photos/{report_id}", response_model=List[ReportPhotoResponse])
async def get_all_report_photos(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las fotos de una memoria.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Memoria no encontrada"
            )

        photos = crud_reports.get_all_report_photos(db, report_id)

        return photos

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/delete/photo/{photo_id}")
async def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una foto de una memoria y su archivo físico asociado.
    Permite la eliminación si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        photo = crud_reports.get_photo_by_id(db, photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=photo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_reports.delete_photo(db, photo_id, photo)

        return {"message": "Foto eliminada correctamente"}

    except Exception as e:
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
    Permite la actualización si el usuario es admin o si es gestor dla memoria.
    """
    try:
        
        photo = crud_reports.get_photo_by_id(db, photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Foto no encontrada")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=photo.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        photo = crud_reports.update_photo(db, photo_id, photo_update)

        return ReportPhotoResponse(
            id=photo.id,
            photo=photo.photo,
            description=photo.description,
            report_id=photo.report_id
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/get/user-role/{report_id}", response_model=UserRoleResponse)
def get_user_role(
    report_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el rol del usuario actual en la memoria especificado.
    """
    
    if current_user.admin:
        return {"role": "manager"}

    
    team_member = crud_reports.get_team_member(db, current_user.id, report_id)

    if not team_member:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un rol asignado para este usuario en la memoria"
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
    Permite el acceso si el usuario es admin, gestor, consultor o asesor dla memoria.
    """
    
    
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    
    report = crud_reports.get_report(db, report_id)
    if not report or not report.org_chart_figure:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    
    
    relative_path = report.org_chart_figure.lstrip('/')
    file_path = settings.BASE_DIR / relative_path

    
    if not file_path.exists():
        
        report.org_chart_figure = None
        db.commit()
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    
    file_extension = file_path.suffix.lower()
    mime_type = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    }.get(file_extension, 'image/jpeg')

    response = FileResponse(
        file_path,
        media_type=mime_type,
        filename=file_path.name
    )
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

    
