from typing import Tuple
from sqlalchemy.orm import Session
from app.models.models import SustainabilityTeamMember

def check_user_permissions(
    db: Session,
    user_id: int,
    report_id: int,
    require_manager: bool = False
) -> Tuple[bool, str]:
    """
    Verifica los permisos del usuario en una memoria específica.
    """
    try:
        
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == report_id,
            SustainabilityTeamMember.user_id == user_id
        ).first()
        
        if not team_member:
            return False, "No tienes permisos para acceder a este recurso"
            
        if require_manager and team_member.type != 'manager':
            return False, "Solo los gestores pueden realizar esta acción"
            
        return True, ""
        
    except Exception as e:
        return False, f"Error al verificar permisos: {str(e)}" 