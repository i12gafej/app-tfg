from typing import Any, Dict, Optional
from pydantic import BaseModel
import secrets
from urllib.parse import quote_plus
import logging

logger = logging.getLogger(__name__)

class Settings(BaseModel):
    PROJECT_NAME: str = "Sustainability App"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 días
    ALGORITHM: str = "HS256"

    # Configuración MySQL
    MYSQL_SERVER: str = "localhost"
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "root"
    MYSQL_DB: str = "sustainability_db"
    MYSQL_PORT: str = "3306"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        escaped_password = quote_plus(self.MYSQL_PASSWORD)
        uri = f"mysql+pymysql://{self.MYSQL_USER}:{escaped_password}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        logger.info(f"URI de conexión a la base de datos: {uri}")
        return uri

    class Config:
        case_sensitive = True

settings = Settings() 