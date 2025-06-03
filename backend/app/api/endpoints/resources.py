from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.schemas.resources import HeritageResourceCreate, HeritageResource, ResourceSearch, HeritageResourceUpdate
from app.schemas.auth import TokenData
from app.api.deps import get_db, get_current_user
from app.services.user import check_user_permissions
from app.crud import resources as crud_resources
from sqlalchemy import or_
from app.models.models import HeritageResource as HeritageResourceModel, SustainabilityReport as SustainabilityReportModel

router = APIRouter()

@router.post("/resources/create", response_model=HeritageResource)
async def create_resource(
    resource: HeritageResourceCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear recursos"
        )

    try:
        resource_data = resource.model_dump()
        
        db_resource = crud_resources.create(db, resource_data)

        # Construir la respuesta
        response = HeritageResource(
            id=db_resource.id,
            name=db_resource.name,
            typology=[t.typology for t in db_resource.typologies],
            ownership=db_resource.ownership,
            management_model=db_resource.management_model,
            postal_address=db_resource.postal_address,
            web_address=db_resource.web_address,
            phone_number=db_resource.phone_number,
            social_networks=[{"network": sn.social_network, "url": sn.url} for sn in db_resource.social_networks]
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el recurso: {str(e)}"
        )

@router.post("/resources/search", response_model=dict)
async def search_resources(
    search_params: ResourceSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar recursos con filtros opcionales.
    Si no se proporcionan filtros, devuelve todos los recursos.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        # Llamar al crud para buscar recursos
        resources = crud_resources.search(
            db=db,
            search_term=search_params.search_term,
            name=search_params.name,
            ownership=search_params.ownership,
            management_model=search_params.management_model,
            postal_address=search_params.postal_address
        )
        total = len(resources)

        # Convertir los recursos a esquema Pydantic
        resources_schema = [
            HeritageResource(
                id=resource.id,
                name=resource.name,
                typology=[t.typology for t in resource.typologies],
                ownership=resource.ownership,
                management_model=resource.management_model,
                postal_address=resource.postal_address,
                web_address=resource.web_address,
                phone_number=resource.phone_number,
                social_networks=[{"network": sn.social_network, "url": sn.url} for sn in resource.social_networks],
            )
            for resource in resources
        ]

        return {
            "items": resources_schema,
            "total": total
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar recursos: {str(e)}"
        )

@router.put("/resources/update/{resource_id}", response_model=HeritageResource)
async def update_resource(
    resource_id: int,
    resource_data: HeritageResourceUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar recursos"
        )

    try:
        # Convertir el modelo Pydantic a dict para el CRUD
        resource_data_dict = resource_data.model_dump()

        db_resource = crud_resources.update(db, resource_id, resource_data_dict)
        if not db_resource:
            raise HTTPException(
                status_code=400,
                detail="Recurso no encontrado"
            )

        return HeritageResource(
            id=db_resource.id,
            name=db_resource.name,
            typology=[t.typology for t in db_resource.typologies],
            ownership=db_resource.ownership,
            management_model=db_resource.management_model,
            postal_address=db_resource.postal_address,
            web_address=db_resource.web_address,
            phone_number=db_resource.phone_number,
            social_networks=[{"network": sn.social_network, "url": sn.url} for sn in db_resource.social_networks]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el recurso: {str(e)}"
        )

@router.delete("/resources/delete/{resource_id}")
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar recursos"
        )

    try:
        if not crud_resources.delete(db, resource_id):
            raise HTTPException(
                status_code=404,
                detail="Recurso no encontrado"
            )

        return {"message": "Recurso eliminado correctamente"} 
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el recurso: {str(e)}"
        )

@router.get("/resources/get-all/reports/{resource_id}", response_model=dict)
async def get_all_reports_by_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los reportes de un recurso patrimonial.
    """
    try:
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=resource_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        result = crud_resources.get_all_reports_by_resource(db, resource_id)
        return {
            "items": result,
            "total": len(result)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los reportes: {str(e)}"
        )

@router.get("/resources/get-all/", response_model=dict)
async def get_all_resources(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los recursos patrimoniales (solo los gestionados si no es admin).
    """
    try:
        if current_user.admin:
            result = crud_resources.get_all_resources(db)
        else:
            result = crud_resources.get_all_resources_manager(db, current_user.id)
        return {
            "items": result,
            "total": len(result)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los recursos: {str(e)}"
        )


