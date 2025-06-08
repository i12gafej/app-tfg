from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.config import settings
import logging


logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


logger.info("Configuración de la base de datos:")
logger.info(f"URL: {settings.DATABASE_URL}")



engine = create_engine(
    str(settings.DATABASE_URL),
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  
    pool_pre_ping=True,  
    poolclass=QueuePool,
    echo=False  
)

try:
    
    with engine.connect() as connection:
        version = connection.execute(text("SELECT VERSION()")).scalar()
        logger.info(f"Conexión exitosa a MySQL versión: {version}")
        logger.info(f"Base de datos: {settings.MYSQL_DB}")
        logger.info(f"Servidor: {settings.MYSQL_SERVER}:{settings.MYSQL_PORT}")
        
        
        tables = connection.execute(text("SHOW TABLES")).fetchall()
        logger.info("Tablas en la base de datos:")
        for table in tables:
            logger.info(f"   - {table[0]}")
            
except Exception as e:
    logger.error(f"Error al conectar a la base de datos: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)