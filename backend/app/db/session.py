from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import logging

# Desactivar logs de SQLAlchemy
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mostrar la configuración de la base de datos
logger.info("Configuración de la base de datos:")
logger.info(f"URL: {settings.SQLALCHEMY_DATABASE_URI}")
logger.info(f"Database: {settings.MYSQL_DB}")
logger.info(f"User: {settings.MYSQL_USER}")
logger.info(f"Host: {settings.MYSQL_SERVER}")
logger.info(f"Port: {settings.MYSQL_PORT}")

# Configuración del engine con manejo de reconexiones
engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Reciclar conexiones cada 30 minutos
    pool_pre_ping=True,  # Verificar conexión antes de usar
    poolclass=QueuePool,
    echo=False  # Mostrar todas las consultas SQL
)

try:
    # Verificar la conexión y mostrar la versión de MySQL
    with engine.connect() as connection:
        version = connection.execute(text("SELECT VERSION()")).scalar()
        logger.info(f"✅ Conexión exitosa a MySQL versión: {version}")
        logger.info(f"   📦 Base de datos: {settings.MYSQL_DB}")
        logger.info(f"   🖥️  Servidor: {settings.MYSQL_SERVER}:{settings.MYSQL_PORT}")
        
        # Verificar las tablas existentes
        tables = connection.execute(text("SHOW TABLES")).fetchall()
        logger.info("Tablas en la base de datos:")
        for table in tables:
            logger.info(f"   - {table[0]}")
            
except Exception as e:
    logger.error(f"❌ Error al conectar a la base de datos: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 