from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from app.models.models import HeritageResource, HeritageResourceTypology, HeritageResourceSocialNetwork, SustainabilityReport, SustainabilityTeamMember
from datetime import datetime

def create(db: Session, resource_data: Dict[str, Any]) -> HeritageResource:
    """
    Crea un recurso patrimonial.
    """
    try:
        db_resource = HeritageResource(
            name=resource_data["name"],
            ownership=resource_data.get("ownership"),
            management_model=resource_data.get("management_model"),
            postal_address=resource_data.get("postal_address"),
            web_address=resource_data.get("web_address"),
            phone_number=resource_data.get("phone_number")
        )
        
        db.add(db_resource)
        db.flush()  

        
        for typology in resource_data["typology"]:
            db_typology = HeritageResourceTypology(
                typology=typology,
                resource_id=db_resource.id
            )
            db.add(db_typology)

        
        for social_network in resource_data["social_networks"]:
            db_social = HeritageResourceSocialNetwork(
                social_network=social_network["network"],
                url=social_network["url"],
                resource_id=db_resource.id
            )
            db.add(db_social)

        
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
    """
    Obtiene un recurso patrimonial.
    """
    try:
        return db.query(HeritageResource)\
            .options(
                joinedload(HeritageResource.typologies),
                joinedload(HeritageResource.social_networks)
            )\
            .filter(HeritageResource.id == resource_id)\
            .first()
    except Exception as e:
        raise e

def get_all_by_resources_ids(db: Session, resource_ids: list) -> List[HeritageResource]:
    """
    Obtiene todos los recursos patrimoniales por una lista de IDs.
    """
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
    """
    Busca recursos patrimoniales.
    """
    try:
        query = db.query(HeritageResource)

        def normalize_text(text: str) -> Optional[str]:
            if not text or text.isspace():
                return None
            return text.strip()

        
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
    """
    Actualiza un recurso patrimonial.
    """
    try:
        db_resource = get(db, resource_id)
        if not db_resource:
            return None

        
        for field, value in resource_data.items():
            if field not in ["typology", "social_networks"] and value is not None:
                setattr(db_resource, field, value)

        
        if "typology" in resource_data:
            
            db.query(HeritageResourceTypology).filter(
                HeritageResourceTypology.resource_id == resource_id
            ).delete()
            
            for typology in resource_data["typology"]:
                db_typology = HeritageResourceTypology(
                    typology=typology,
                    resource_id=resource_id
                )
                db.add(db_typology)

        
        if "social_networks" in resource_data:
            
            db.query(HeritageResourceSocialNetwork).filter(
                HeritageResourceSocialNetwork.resource_id == resource_id
            ).delete()
            
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
    """
    Elimina un recurso patrimonial.
    """
    try:
        db_resource = get(db, resource_id)
        if not db_resource:
            return False

        
        db.delete(db_resource)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_reports_by_resource(
    db: Session,
    resource_id: int
) -> List[dict]:
    """
    Obtener todas las memorias de un recurso patrimonial.
    """
    try:
        reports = db.query(
            SustainabilityReport.id,
            SustainabilityReport.heritage_resource_id,
            SustainabilityReport.year
        ).filter(
            SustainabilityReport.heritage_resource_id == resource_id
        ).all()

        return [
            {
                "id": report.id,
                "heritage_resource_id": report.heritage_resource_id,
                "year": report.year
            }
            for report in reports
        ]
    except Exception as e:
        raise e

def get_all_resources(
    db: Session
) -> List[dict]:
    """
    Obtener todos los recursos patrimoniales.
    """
    try:
        resources = db.query(
            HeritageResource.id,
            HeritageResource.name
        ).all()

        return [
            {
                "id": resource.id,
                "name": resource.name
            }
            for resource in resources
        ]
    except Exception as e:
        raise e

def get_all_resources_manager(db: Session, user_id: int) -> list:
    """
    Devuelve los recursos patrimoniales de los que el usuario es gestor en alguna memoria de sostenibilidad.
    """
    try:
        
        managed_reports = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.user_id == user_id,
            SustainabilityTeamMember.type == 'manager'
        ).all()
        if not managed_reports:
            return []
        
        report_ids = [tm.report_id for tm in managed_reports]
        resource_ids = db.query(SustainabilityReport.heritage_resource_id).filter(
            SustainabilityReport.id.in_(report_ids)
        ).distinct()
        
        resources = db.query(HeritageResource).filter(
            HeritageResource.id.in_(resource_ids)
        ).all()
        return [
            {
                "id": resource.id,
                "name": resource.name
            }
            for resource in resources
        ]
    except Exception as e:
        raise e
