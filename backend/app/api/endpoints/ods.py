from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.ods import (
    ODS, SecondaryImpactUpdate, SecondaryImpactResponse, 
    DimensionResponse, ActionSecondaryImpactUpdate, ActionSecondaryImpactResponse,
    ActionSecondaryImpactCountList, ActionSecondaryImpactCount, ODSList
)
from app.schemas.auth import TokenData
from app.crud import ods as crud_ods
from app.crud import material_topics as crud_material_topics
from app.crud import action_plan as crud_action_plan
from app.utils.graphs.main_secondary_impacts import (
    get_main_impacts_material_topics_graph,
    get_secondary_impacts_material_topics_graph
)

from app.services.user import check_user_permissions
from app.models.models import MaterialTopic as MaterialTopicModel, Action as ActionModel



router = APIRouter()

@router.get("/ods/get-all", response_model=ODSList)
def get_all_ods(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los ODS.
    Permite el acceso a cualquier usuario autenticado ya que los ODS son recursos globales.
    """
    try:
       
        ods_list = crud_ods.get_all_ods(db)
        
        return ODSList(
            items=ods_list,
            total=len(ods_list)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener ODS: {str(e)}"
        )

@router.get("/ods/get/secondary-impacts/{material_topic_id}", response_model=SecondaryImpactResponse)
def get_secondary_impacts(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener los impactos secundarios de un asunto de materialidad.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor.
    """
    try:
        
        material_topic = crud_material_topics.get(db, material_topic_id)
        if not material_topic:
            raise HTTPException(status_code=404, detail="asunto de materialidad no encontrado")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=material_topic.report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        ods_ids = crud_ods.get_secondary_impacts(db, material_topic_id)
        return {
            "material_topic_id": material_topic_id,
            "ods_ids": ods_ids
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos secundarios: {str(e)}"
        )

@router.get("/ods/get/main-impacts-graph/{report_id}")
def get_main_impacts_graph(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la gráfica de impactos principales de un reporte.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor.
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

        
        material_topics = crud_material_topics.get_all_by_report(db, report_id)
        
        
        graph_data_url = get_main_impacts_material_topics_graph(material_topics)
        
        return {"graph_data_url": graph_data_url}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la gráfica de impactos principales: {str(e)}"
        )

@router.get("/ods/get/secondary-impacts-graph/{report_id}")
def get_secondary_impacts_graph(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la gráfica de impactos secundarios de un reporte.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor.
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

        
        secondary_impacts = crud_ods.get_all_secondary_impacts_by_report(db, report_id)
        
        
        graph_data_url = get_secondary_impacts_material_topics_graph(secondary_impacts)
        
        return {"graph_data_url": graph_data_url}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la gráfica de impactos secundarios: {str(e)}"
        )

@router.put("/ods/update/secondary-impacts", response_model=SecondaryImpactResponse)
def update_secondary_impacts(
    update_data: SecondaryImpactUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar los impactos secundarios de un asunto de materialidad.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        
        material_topic = crud_material_topics.get(db, update_data.material_topic_id)
        if not material_topic:
            raise HTTPException(status_code=404, detail="asunto de materialidad no encontrado")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=material_topic.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        crud_ods.update_secondary_impacts(
            db,
            update_data.material_topic_id,
            update_data.ods_ids
        )
        return {
            "material_topic_id": update_data.material_topic_id,
            "ods_ids": update_data.ods_ids
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar impactos secundarios: {str(e)}"
        )

@router.get("/ods/get-all/dimensions", response_model=DimensionResponse)
async def get_all_dimensions(
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las dimensiones de los ODS con sus ODS correspondientes.
    """
    try:
        ods_by_dimension = crud_ods.get_all_ods_with_dimension(db)
        
        
        dimensions = []
        for dimension_name, ods_list in ods_by_dimension.items():
            dimensions.append({
                "name": dimension_name,
                "description": f"ODS relacionados con la dimensión {dimension_name}",
                "ods": ods_list
            })
        
        return {"dimensions": dimensions}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener dimensiones: {str(e)}"
        )

@router.get("/ods/get/action-secondary-impacts/{action_id}", response_model=ActionSecondaryImpactResponse)
def get_action_secondary_impacts(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener los impactos secundarios de una acción.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor.
    """
    try:

        action = db.query(ActionModel).filter(ActionModel.id == action_id).first()
        report_id = crud_action_plan.get_report_id_by_action(db, action_id)
        if not action:
            raise HTTPException(status_code=404, detail="Acción no encontrada")

        
        if not current_user.admin:
            
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id
            )
            
            
            if not has_permission:
                
                raise HTTPException(status_code=403, detail=error_message)

        
        ods_ids = crud_ods.get_action_secondary_impacts(db, action_id)
        
        
        return {
            "action_id": action_id,
            "ods_ids": ods_ids
        }
    except Exception as e:
        
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos secundarios de la acción: {str(e)}"
        )

@router.put("/ods/update/action-secondary-impacts/{action_id}", response_model=ActionSecondaryImpactResponse)
def update_action_secondary_impacts(
    action_id: int,
    update_data: ActionSecondaryImpactUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar los impactos secundarios de una acción.
    Permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        
        report_id = crud_action_plan.get_report_id_by_action(db, action_id)
        if not report_id:
            raise HTTPException(status_code=404, detail="Acción no encontrada en una memoria de sostenibilidad")

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        if update_data.action_id != action_id:
            raise HTTPException(
                status_code=400,
                detail="El ID de la acción en la ruta no coincide con el del cuerpo de la petición"
            )

        crud_ods.update_action_secondary_impacts(
            db,
            action_id,
            update_data.ods_ids
        )
        return {
            "action_id": action_id,
            "ods_ids": update_data.ods_ids
        }
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar impactos secundarios de la acción: {str(e)}"
        )


@router.get("/ods/get-all/action-secondary-impacts/{report_id}", response_model=ActionSecondaryImpactCountList)
def get_all_action_secondary_impacts(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener el recuento de impactos secundarios de todas las acciones de un reporte.
    Permite el acceso si el usuario es admin, gestor, consultor o asesor.
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
        

        impacts = crud_ods.get_all_action_secondary_impacts_counts(db, report_id)
        
        return {
            "items": [ActionSecondaryImpactCount(**impact) for impact in impacts],
            "total": len(impacts)
        }
    except Exception as e:
        
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos secundarios de acciones: {str(e)}"
        )

