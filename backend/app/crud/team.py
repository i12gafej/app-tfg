from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import HeritageResource, SustainabilityReport, SustainabilityTeamMember, User
from app.schemas.team import ResourceSearch, ReportSearch, TeamMemberSearch

def get_resources(db: Session) -> List[HeritageResource]:
    """Obtener todos los recursos patrimoniales"""
    return db.query(HeritageResource).all()

def get_reports_by_resource(db: Session, resource_id: int) -> List[SustainabilityReport]:
    """Obtener todas las memorias de un recurso"""
    return db.query(SustainabilityReport).filter(SustainabilityReport.resource_id == resource_id).all()

def get_team_members(db: Session, report_id: int) -> List[SustainabilityTeamMember]:
    """Obtener todos los miembros del equipo de una memoria"""
    return db.query(SustainabilityTeamMember).filter(SustainabilityTeamMember.report_id == report_id).all()

def search_resources(
    db: Session,
    search_params: ResourceSearch
) -> dict:
    """
    Buscar recursos patrimoniales con filtros opcionales.
    """
    query = db.query(HeritageResource)

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
            query = query.filter(HeritageResource.name.ilike(search))

    if search_params.name:
        name = normalize_text(search_params.name)
        if name:
            query = query.filter(HeritageResource.name.ilike(f"%{name}%"))

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Aplicar paginación
    resources = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": resources,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

def search_reports(
    db: Session,
    search_params: ReportSearch
) -> dict:
    """
    Buscar reportes de un recurso patrimonial con filtros opcionales.
    """
    query = db.query(SustainabilityReport).filter(SustainabilityReport.heritage_resource_id == search_params.resource_id)

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
            query = query.filter(SustainabilityReport.year.ilike(search))

    if search_params.year:
        year = normalize_text(search_params.year)
        if year:
            query = query.filter(SustainabilityReport.year.ilike(f"%{year}%"))

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Aplicar paginación
    reports = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": reports,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

def search_team_members(
    db: Session,
    report_id: int,
    search_params: TeamMemberSearch
) -> dict:
    """
    Buscar miembros del equipo de un reporte con filtros opcionales.
    """
    query = db.query(SustainabilityTeamMember).filter(SustainabilityTeamMember.report_id == report_id)

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

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Aplicar paginación
    members = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": members,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

def create_team_member(
    db: Session,
    report_id: int,
    user_id: int,
    role: str,
    organization: str
) -> SustainabilityTeamMember:
    """Crear un nuevo miembro del equipo"""
    # Verificar si el usuario ya es miembro
    existing_member = db.query(SustainabilityTeamMember).filter(
        SustainabilityTeamMember.report_id == report_id,
        SustainabilityTeamMember.user_id == user_id
    ).first()
    
    if existing_member:
        raise ValueError("El usuario ya es miembro del equipo")

    # Obtener datos del usuario
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("Usuario no encontrado")

    # Crear el miembro del equipo
    team_member = SustainabilityTeamMember(
        report_id=report_id,
        user_id=user_id,
        name=user.name,
        surname=user.surname,
        email=user.email,
        role=role,
        organization=organization
    )

    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    return team_member