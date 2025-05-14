from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.models import HeritageResource, HeritageResourceTypology, HeritageResourceSocialNetwork, SustainabilityReport
from datetime import datetime

def create(db: Session, resource_data: Dict[str, Any]) -> HeritageResource:
    try:
        
        # Crear el recurso principal
        db_resource = HeritageResource(
            name=resource_data["name"],
            ownership=resource_data.get("ownership"),
            management_model=resource_data.get("management_model"),
            postal_address=resource_data.get("postal_address"),
            web_address=resource_data.get("web_address"),
            phone_number=resource_data.get("phone_number")
        )
        
        db.add(db_resource)
        db.flush()  # Para obtener el ID del recurso creado

        # Crear las tipologías
        for typology in resource_data["typology"]:
            db_typology = HeritageResourceTypology(
                typology=typology,
                resource_id=db_resource.id
            )
            db.add(db_typology)

        # Crear las redes sociales
        for social_network in resource_data["social_networks"]:
            db_social = HeritageResourceSocialNetwork(
                social_network=social_network["network"],
                url=social_network["url"],
                resource_id=db_resource.id
            )
            db.add(db_social)

        # Crear memoria vacía para el año actual
        current_year = datetime.now().year
        db_report = SustainabilityReport(
            heritage_resource_id=db_resource.id,
            year=current_year,
            state='Draft',
            observation='',
            scale=0
        )
        db.add(db_report)

        db.commit()
        db.refresh(db_resource)
        return db_resource
        
    except Exception as e:
        raise e

def get(db: Session, resource_id: int) -> Optional[HeritageResource]:
    try:
        return db.query(HeritageResource).filter(HeritageResource.id == resource_id).first()
    except Exception as e:
        raise e

def get_all_by_resources_ids(db: Session, resource_ids: list) -> List[HeritageResource]:
    try:
        if not resource_ids:
            return []
        return db.query(HeritageResource).filter(HeritageResource.id.in_(resource_ids)).all()
    except Exception as e:
        raise e

def search(
    db: Session,
    search_term: Optional[str] = None,
    name: Optional[str] = None,
    ownership: Optional[str] = None,
    management_model: Optional[str] = None,
    postal_address: Optional[str] = None
) -> List[HeritageResource]:
    try:
        query = db.query(HeritageResource)

        def normalize_text(text: str) -> Optional[str]:
            if not text or text.isspace():
                return None
            return text.strip()

        # Filtro general
        if search_term:
            search = normalize_text(search_term)
            if search:
                search = f"%{search}%"
                query = query.filter(
                    HeritageResource.name.ilike(search) |
                    HeritageResource.ownership.ilike(search) |
                    HeritageResource.management_model.ilike(search) |
                    HeritageResource.postal_address.ilike(search)
                )

        # Filtros específicos
        if name:
            name_val = normalize_text(name)
            if name_val:
                query = query.filter(HeritageResource.name.ilike(f"%{name_val}%"))
        if ownership:
            ownership_val = normalize_text(ownership)
            if ownership_val:
                query = query.filter(HeritageResource.ownership.ilike(f"%{ownership_val}%"))
        if management_model:
            management_model_val = normalize_text(management_model)
            if management_model_val:
                query = query.filter(HeritageResource.management_model.ilike(f"%{management_model_val}%"))
        if postal_address:
            postal_address_val = normalize_text(postal_address)
            if postal_address_val:
                query = query.filter(HeritageResource.postal_address.ilike(f"%{postal_address_val}%"))

        return query.all()
    except Exception as e:
        raise e

def update(
    db: Session,
    resource_id: int,
    resource_data: Dict[str, Any]
) -> Optional[HeritageResource]:
    try:
        db_resource = get(db, resource_id)
        if not db_resource:
            return None

        # Actualizar campos del recurso principal
        for field, value in resource_data.items():
            if field not in ["typology", "social_networks"] and value is not None:
                setattr(db_resource, field, value)

        # Actualizar tipologías
        if "typology" in resource_data:
            # Eliminar tipologías existentes
            db.query(HeritageResourceTypology).filter(
                HeritageResourceTypology.resource_id == resource_id
            ).delete()
            # Crear nuevas tipologías
            for typology in resource_data["typology"]:
                db_typology = HeritageResourceTypology(
                    typology=typology,
                    resource_id=resource_id
                )
                db.add(db_typology)

        # Actualizar redes sociales
        if "social_networks" in resource_data:
            # Eliminar redes sociales existentes
            db.query(HeritageResourceSocialNetwork).filter(
                HeritageResourceSocialNetwork.resource_id == resource_id
            ).delete()
            # Crear nuevas redes sociales
            for social_network in resource_data["social_networks"]:
                db_social = HeritageResourceSocialNetwork(
                    social_network=social_network["network"],
                    url=social_network["url"],
                    resource_id=resource_id
                )
                db.add(db_social)

        db.commit()
        db.refresh(db_resource)
        return db_resource
    except Exception as e:
        raise e

def delete(db: Session, resource_id: int) -> bool:
    try:
        db_resource = get(db, resource_id)
        if not db_resource:
            return False

        # Las relaciones tienen cascade="all, delete-orphan", así que se eliminarán automáticamente
        db.delete(db_resource)
        db.commit()
        return True
    except Exception as e:
        raise e
