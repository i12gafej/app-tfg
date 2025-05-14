from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging
from app.schemas.resources import HeritageResourceCreate, HeritageResource, ResourceSearch
from app.schemas.auth import TokenData
from app.api.deps import get_db, get_current_user
from app.crud.resources import create, get, search, update, delete
from sqlalchemy import or_
from app.models.models import HeritageResource as HeritageResourceModel

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/resources/create", response_model=HeritageResource)
async def create_resource_endpoint(
    resource: HeritageResourceCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Verificar que el usuario es administrador
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear recursos"
        )

    try:
        logger.info(f"Recibiendo datos del recurso: {resource.model_dump()}")
        
        # Convertir el modelo Pydantic a dict para el CRUD
        resource_data = resource.model_dump()
        logger.info(f"Datos convertidos a dict: {resource_data}")
        
        # Crear el recurso usando el CRUD
        db_resource = create(db, resource_data)
        logger.info(f"Recurso creado en la base de datos: {db_resource}")

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
        logger.info(f"Respuesta construida: {response}")

        return response

    except Exception as e:
        logger.error(f"Error al crear el recurso: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el recurso: {str(e)}"
        )

@router.post("/resources/search", response_model=dict)
async def search_resources_endpoint(
    search_params: ResourceSearch,
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

    # Llamar al crud para buscar recursos
    resources = search(
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

@router.post("/resources/update", response_model=HeritageResource)
async def update_resource_endpoint(
    resource_id: int = Body(...),
    resource_data: HeritageResourceCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar recursos"
        )

    # Convertir el modelo Pydantic a dict para el CRUD
    resource_data_dict = resource_data.model_dump()
    
    db_resource = update(db, resource_id, resource_data_dict)
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

@router.delete("/resources/delete/{resource_id}")
async def delete_resource_endpoint(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar recursos"
        )

    if not delete(db, resource_id):
        raise HTTPException(
            status_code=404,
            detail="Recurso no encontrado"
        )

    return {"message": "Recurso eliminado correctamente"} 