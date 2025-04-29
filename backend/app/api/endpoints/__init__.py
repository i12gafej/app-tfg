from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .resources import router as resources_router
from .stakeholders import router as stakeholders_router
from .material_topics import router as material_topics_router
from .ods import router as ods_router
from .goals import router as goals_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"]) 
api_router.include_router(resources_router, prefix="/resources", tags=["resources"])
api_router.include_router(stakeholders_router, prefix="/stakeholders", tags=["stakeholders"])
api_router.include_router(material_topics_router, prefix="/material-topics", tags=["material-topics"])
api_router.include_router(ods_router, prefix="/ods", tags=["ods"])
api_router.include_router(goals_router, prefix="/goals", tags=["goals"])