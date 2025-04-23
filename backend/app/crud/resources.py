from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.models import HeritageResource, HeritageResourceTypology, HeritageResourceSocialNetwork, SustainabilityReport
from datetime import datetime
import logging

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create(db: Session, resource_data: Dict[str, Any]) -> HeritageResource:
    try:
        logger.info(f"Iniciando creación de recurso con datos: {resource_data}")
        
        # Crear el recurso principal
        db_resource = HeritageResource(
            name=resource_data["name"],
            ownership=resource_data.get("ownership"),
            management_model=resource_data.get("management_model"),
            postal_address=resource_data.get("postal_address"),
            web_address=resource_data.get("web_address"),
            phone_number=resource_data.get("phone_number")
        )
        logger.info(f"Recurso principal creado: {db_resource}")
        
        db.add(db_resource)
        db.flush()  # Para obtener el ID del recurso creado
        logger.info(f"ID del recurso generado: {db_resource.id}")

        # Crear las tipologías
        logger.info(f"Creando tipologías: {resource_data['typology']}")
        for typology in resource_data["typology"]:
            db_typology = HeritageResourceTypology(
                typology=typology,
                resource_id=db_resource.id
            )
            db.add(db_typology)
            logger.info(f"Tipología creada: {db_typology}")

        # Crear las redes sociales
        logger.info(f"Creando redes sociales: {resource_data['social_networks']}")
        for social_network in resource_data["social_networks"]:
            db_social = HeritageResourceSocialNetwork(
                social_network=social_network["network"],
                url=social_network["url"],
                resource_id=db_resource.id
            )
            db.add(db_social)
            logger.info(f"Red social creada: {db_social}")

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
        logger.info(f"Memoria vacía creada para el año {current_year}")

        db.commit()
        db.refresh(db_resource)
        logger.info(f"Recurso final creado: {db_resource}")
        return db_resource
        
    except Exception as e:
        logger.error(f"Error en la creación del recurso: {str(e)}", exc_info=True)
        raise

def get(db: Session, resource_id: int) -> Optional[HeritageResource]:
    return db.query(HeritageResource).filter(HeritageResource.id == resource_id).first()

def search(
    db: Session,
    name: Optional[str] = None,
    ownership: Optional[str] = None,
    management_model: Optional[str] = None,
    postal_address: Optional[str] = None,
    typology: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[HeritageResource]:
    query = db.query(HeritageResource)

    if name:
        query = query.filter(HeritageResource.name.ilike(f"%{name}%"))
    if ownership:
        query = query.filter(HeritageResource.ownership.ilike(f"%{ownership}%"))
    if management_model:
        query = query.filter(HeritageResource.management_model.ilike(f"%{management_model}%"))
    if postal_address:
        query = query.filter(HeritageResource.postal_address.ilike(f"%{postal_address}%"))
    if typology:
        query = query.join(HeritageResourceTypology).filter(HeritageResourceTypology.typology.ilike(f"%{typology}%"))

    return query.offset(skip).limit(limit).all()

def update(
    db: Session,
    resource_id: int,
    resource_data: Dict[str, Any]
) -> Optional[HeritageResource]:
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

def delete(db: Session, resource_id: int) -> bool:
    db_resource = get(db, resource_id)
    if not db_resource:
        return False

    # Las relaciones tienen cascade="all, delete-orphan", así que se eliminarán automáticamente
    db.delete(db_resource)
    db.commit()
    return True 