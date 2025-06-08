from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import HeritageResource, SustainabilityReport, SustainabilityTeamMember, User
from app.schemas.team import TeamMemberSearch, TeamMemberCreate

def search_available_users(
    db: Session,
    search_term: Optional[str] = None,
    name: Optional[str] = None,
    surname: Optional[str] = None,
    email: Optional[str] = None
) -> List[User]:
    """
    Busca usuarios disponibles para agregar a un equipo.
    """
    try:
        query = db.query(User).filter(User.admin == False)

        def normalize_text(text: str) -> Optional[str]:
            if not text or text.isspace():
                return None
            return text.strip()

        if search_term:
            search = normalize_text(search_term)
            if search:
                search = f"%{search}%"
                query = query.filter(
                    User.name.ilike(search) |
                    User.surname.ilike(search) |
                    User.email.ilike(search)
                )
        if name:
            name_val = normalize_text(name)
            if name_val:
                query = query.filter(User.name.ilike(f"%{name_val}%"))
        if surname:
            surname_val = normalize_text(surname)
            if surname_val:
                query = query.filter(User.surname.ilike(f"%{surname_val}%"))
        if email:
            email_val = normalize_text(email)
            if email_val:
                query = query.filter(User.email.ilike(f"%{email_val}%"))

        return query.all()
    except Exception as e:
        raise e

def search_team_members(
    db: Session,
    report_id: int,
    search_params: TeamMemberSearch
) -> dict:
    """
    Busca miembros del equipo de una memoria con filtros opcionales.
    """
    try:
        query = db.query(SustainabilityTeamMember).filter(SustainabilityTeamMember.report_id == report_id)

        def normalize_text(text: str) -> str:
            if not text or text.isspace():
                return None
            return text.strip()

        if search_params.search_term:
            search = normalize_text(search_params.search_term)
            if search:
                search = f"%{search}%"
                query = query.filter(
                    or_(
                        SustainabilityTeamMember.name.ilike(search),
                        SustainabilityTeamMember.surname.ilike(search),
                        SustainabilityTeamMember.email.ilike(search),
                        SustainabilityTeamMember.role.ilike(search),
                        SustainabilityTeamMember.organization.ilike(search)
                    )
                )

        if search_params.name:
            name = normalize_text(search_params.name)
            if name:
                query = query.filter(SustainabilityTeamMember.name.ilike(f"%{name}%"))

        if search_params.surname:
            surname = normalize_text(search_params.surname)
            if surname:
                query = query.filter(SustainabilityTeamMember.surname.ilike(f"%{surname}%"))

        if search_params.email:
            email = normalize_text(search_params.email)
            if email:
                query = query.filter(SustainabilityTeamMember.email.ilike(f"%{email}%"))

        if search_params.role:
            role = normalize_text(search_params.role)
            if role:
                query = query.filter(SustainabilityTeamMember.role.ilike(f"%{role}%"))

        if search_params.organization:
            organization = normalize_text(search_params.organization)
            if organization:
                query = query.filter(SustainabilityTeamMember.organization.ilike(f"%{organization}%"))

        return query.all()
    except Exception as e:
        raise e

def create_team_member(
    db: Session,
    team_member_data: TeamMemberCreate
) -> SustainabilityTeamMember:
    """
    Crea un nuevo miembro del equipo.
    """
    try:
        
        existing_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == team_member_data.report_id,
            SustainabilityTeamMember.user_id == team_member_data.user_id
        ).first()
    
        if existing_member:
            raise ValueError("El usuario ya es miembro del equipo")

        
        team_member = SustainabilityTeamMember(
            report_id=team_member_data.report_id,
            user_id=team_member_data.user_id,
            type=team_member_data.role,
            organization=team_member_data.organization
        )

        db.add(team_member)
        db.commit()
        db.refresh(team_member)
        return team_member
    except Exception as e:
        raise e

def update_team_member(
    db: Session,
    member_id: int,
    update_data: dict
) -> SustainabilityTeamMember:
    """
    Actualiza un miembro del equipo.
    """
    try:
        
        member = db.query(SustainabilityTeamMember).filter(SustainabilityTeamMember.id == member_id).first()
        if not member:
            raise ValueError("Miembro del equipo no encontrado")

        
        member.type = update_data["role"]
        member.organization = update_data["organization"]

        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    except Exception as e:
        raise e

def delete_team_member(
    db: Session,
    member_id: int
) -> None:
    """
    Elimina un miembro del equipo.
    """
    try:
        
        member = db.query(SustainabilityTeamMember).filter(SustainabilityTeamMember.id == member_id).first()
        if not member:
            raise ValueError("Miembro del equipo no encontrado")

        
        db.delete(member)
        db.commit()
    except Exception as e:
        raise e

def get_all_team_members_by_report(db: Session, report_id: int) -> List[dict]:
    """
    Obtiene todos los miembros del equipo de una memoria.
    """
    try:
        members = db.query(
            SustainabilityTeamMember.type.label('role'),
            SustainabilityTeamMember.organization,
            User.name,
            User.surname
        ).join(
            User, 
            SustainabilityTeamMember.user_id == User.id
        ).filter(
            SustainabilityTeamMember.report_id == report_id
        ).all()
        
        return [{
            "role": member.role,
            "organization": member.organization,
            "name": member.name,
            "surname": member.surname
        } for member in members]
    except Exception as e:
        raise e
