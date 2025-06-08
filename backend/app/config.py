from pydantic import BaseModel
import secrets
from urllib.parse import quote_plus
import os
from pathlib import Path
import dotenv

dotenv.load_dotenv()

class Settings(BaseModel):
    """
    Configuración de la aplicación
    """
    PROJECT_NAME: str = "Patrimonio2030 App"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  
    ALGORITHM: str = "HS256"

    
    BASE_DIR: Path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    STATIC_DIR: Path = BASE_DIR / "static"
    UPLOADS_DIR: Path = STATIC_DIR / "uploads"
    COVERS_DIR: Path = UPLOADS_DIR / "covers"
    LOGOS_DIR: Path = UPLOADS_DIR / "logos"
    PHOTOS_DIR: Path = UPLOADS_DIR / "gallery"
    REPORTS_DIR: Path = UPLOADS_DIR / "reports"
    ORGANIZATION_CHART_DIR: Path = UPLOADS_DIR / "organization_charts"

    
    ON_REPORT_DIR: Path = STATIC_DIR / "on_report"
    IMAGES_DIR: Path = ON_REPORT_DIR / "images"
    DEFAULT_TEXT_DIR: Path = ON_REPORT_DIR / "default_text"

    
    A4_RATIO: float = 1.4142  
    A4_WIDTH: int = 2480    
    A4_HEIGHT: int = 3508   

    
    MYSQL_SERVER: str = os.getenv("MYSQL_SERVER")
    MYSQL_USER: str = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD")
    MYSQL_DB: str = os.getenv("MYSQL_DB")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT")
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    

    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: str = os.getenv("MAIL_FROM")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Patrimonio 2030")

    FRONTEND_URL: str = os.getenv("FRONTEND_URL")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL")

    def create_directories(self):
        """Crea todos los directorios necesarios si no existen."""
        directories = [
            self.STATIC_DIR,
            self.UPLOADS_DIR,
            self.COVERS_DIR,
            self.LOGOS_DIR,
            self.PHOTOS_DIR,
            self.REPORTS_DIR,
            self.ORGANIZATION_CHART_DIR,
            self.ON_REPORT_DIR,
            self.IMAGES_DIR,
            self.DEFAULT_TEXT_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        escaped_password = quote_plus(self.MYSQL_PASSWORD)
        uri = f"mysql+pymysql://{self.MYSQL_USER}:{escaped_password}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        return uri

   

    class Config:
        case_sensitive = True

settings = Settings()
settings.create_directories()  