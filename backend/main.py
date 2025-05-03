from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, users, resources, team, reports, stakeholders, material_topics, goals
from app.api.endpoints import ods, surveys, diagnosis_indicators, action_plan, monitoring, backup
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"]) 
app.include_router(resources.router, prefix=settings.API_V1_STR, tags=["resources"])
app.include_router(team.router, prefix=settings.API_V1_STR, tags=["team"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["reports"])
app.include_router(stakeholders.router, prefix=settings.API_V1_STR, tags=["stakeholders"])
app.include_router(material_topics.router, prefix=settings.API_V1_STR, tags=["material_topics"])
app.include_router(goals.router, prefix=settings.API_V1_STR, tags=["goals"])
app.include_router(ods.router, prefix=settings.API_V1_STR, tags=["ods"])
app.include_router(surveys.router, prefix=settings.API_V1_STR, tags=["surveys"])
app.include_router(diagnosis_indicators.router, prefix=settings.API_V1_STR, tags=["diagnosis_indicators"])
app.include_router(action_plan.router, prefix=settings.API_V1_STR, tags=["action_plan"])
app.include_router(monitoring.router, prefix=settings.API_V1_STR, tags=["monitoring"])
app.include_router(backup.router, prefix=settings.API_V1_STR, tags=["backup"])