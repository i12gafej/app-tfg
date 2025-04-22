from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.schemas.resources import HeritageResourceCreate, HeritageResource, ResourceSearch
from app.schemas.auth import TokenData
from app.api.deps import get_db, get_current_user
from app.crud.resources import create, get, search, update, delete
from sqlalchemy import or_
from app.models.models import HeritageResource as HeritageResourceModel

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
        # Convertir el modelo Pydantic a dict para el CRUD
        resource_data = resource.model_dump()
        
        # Crear el recurso usando el CRUD
        db_resource = create(db, resource_data)

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
            social_networks=[sn.social_network for sn in db_resource.social_networks]
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el recurso: {str(e)}"
        )

@router.post("/resources/search", response_model=dict)
async def search_resources_endpoint(
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

    query = db.query(HeritageResourceModel).options(
        joinedload(HeritageResourceModel.typologies),
        joinedload(HeritageResourceModel.social_networks)
    )

    # Función para limpiar y normalizar el texto
    def normalize_text(text: str) -> str:
        if not text or text.isspace():
            return None
        return text.strip()

    # Aplicar filtros solo si tienen valores
    if search_params.search_term:
        search = normalize_text(search_params.search_term)
        if search:
            search = f"%{search}%"
            query = query.filter(
                or_(
                    HeritageResourceModel.name.ilike(search),
                    HeritageResourceModel.ownership.ilike(search),
                    HeritageResourceModel.management_model.ilike(search),
                    HeritageResourceModel.postal_address.ilike(search)
                )
            )

    # Aplicar filtros específicos solo si tienen valores
    if search_params.name:
        name = normalize_text(search_params.name)
        if name:
            query = query.filter(HeritageResourceModel.name.ilike(f"%{name}%"))
    
    if search_params.ownership:
        ownership = normalize_text(search_params.ownership)
        if ownership:
            query = query.filter(HeritageResourceModel.ownership.ilike(f"%{ownership}%"))
    
    if search_params.management_model:
        management_model = normalize_text(search_params.management_model)
        if management_model:
            query = query.filter(HeritageResourceModel.management_model.ilike(f"%{management_model}%"))
    
    if search_params.postal_address:
        postal_address = normalize_text(search_params.postal_address)
        if postal_address:
            query = query.filter(HeritageResourceModel.postal_address.ilike(f"%{postal_address}%"))

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Aplicar paginación
    resources = query.offset((page - 1) * per_page).limit(per_page).all()

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
            social_networks=[f"{sn.social_network}:{sn.url}" for sn in resource.social_networks],
        )
        for resource in resources
    ]

    return {
        "items": resources_schema,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.post("/resources/update", response_model=HeritageResource)
async def update_resource_endpoint(
    resource_id: int,
    resource: HeritageResourceCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar recursos"
        )

    # Convertir el modelo Pydantic a dict para el CRUD
    resource_data = resource.model_dump()
    # Tomar el primer elemento de la lista de tipologías
    resource_data['typology'] = resource_data['typology'][0] if resource_data['typology'] else None
    # Convertir la lista de redes sociales a string
    resource_data['social_networks'] = ','.join(resource_data['social_networks']) if resource_data['social_networks'] else None

    db_resource = update(db, resource_id, resource_data)
    if not db_resource:
        raise HTTPException(
            status_code=400,
            detail="Recurso no encontrado"
        )

    return HeritageResource(
        id=db_resource.id,
        name=db_resource.name,
        typology=[db_resource.typology],  # Convertir el string a lista
        ownership=db_resource.ownership,
        management_model=db_resource.management_model,
        postal_address=db_resource.postal_address,
        web_address=db_resource.web_address,
        phone_number=db_resource.phone_number,
        social_networks=db_resource.social_networks.split(',') if db_resource.social_networks else [],  # Convertir el string a lista
    )

@router.delete("/resources/delete")
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