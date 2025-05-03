from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
import subprocess
import logging
from typing import Optional

from app.core.config import settings
from app.api.deps import get_db, get_current_user
from app.schemas.backup import BackupResponse, RestoreResponse
from app.schemas.auth import TokenData

# Configuración del logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Crear un manejador de archivo
log_dir = os.path.join(settings.BASE_DIR, "logs")
os.makedirs(log_dir, exist_ok=True)
file_handler = logging.FileHandler(os.path.join(log_dir, "backup.log"))
file_handler.setLevel(logging.INFO)

# Crear un manejador de consola
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Crear un formateador
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Añadir los manejadores al logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

router = APIRouter()

@router.post("/backup/create")
async def create_backup(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Iniciando creación de backup por usuario: {current_user.email}")
        
        # Crear directorio de backups si no existe
        backup_dir = os.path.join(settings.BASE_DIR, "backups")
        os.makedirs(backup_dir, exist_ok=True)
        logger.info(f"Directorio de backup verificado/creado: {backup_dir}")

        # Generar nombre del archivo con timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.sql"
        filepath = os.path.join(backup_dir, filename)
        logger.info(f"Archivo de backup a crear: {filename}")

        # Comando para crear el backup usando MySQL
        command = ["docker", "exec", "mysql-container", "mysqldump", "-u", "root", "-proot", "sustainability_db"]
        logger.info("Ejecutando comando de backup")

        # Ejecutar el comando y redirigir la salida al archivo
        with open(filepath, 'w') as f:
            subprocess.run(command, stdout=f, check=True)
        logger.info("Backup creado exitosamente")

        # Devolver el archivo directamente
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/sql'
        )

    except Exception as e:
        error_msg = f"Error al crear el backup: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

@router.post("/backup/restore", response_model=RestoreResponse)
async def restore_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Iniciando restauración de backup por usuario: {current_user.email}")
        logger.info(f"Archivo recibido: {file.filename}")

        # Verificar que el archivo sea .sql
        if not file.filename.endswith('.sql'):
            error_msg = "El archivo debe ser un backup SQL válido"
            logger.error(error_msg)
            raise HTTPException(
                status_code=400,
                detail=error_msg
            )

        # Crear directorio temporal si no existe
        temp_dir = os.path.join(settings.BASE_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        logger.info(f"Directorio temporal verificado/creado: {temp_dir}")

        # Guardar el archivo temporalmente
        temp_filepath = os.path.join(temp_dir, file.filename)
        with open(temp_filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        logger.info(f"Archivo temporal guardado en: {temp_filepath}")

        # Comando para restaurar el backup usando MySQL
        command = ["docker", "exec", "-i", "mysql-container", "mysql", "-u", "root", "-proot", "sustainability_db"]
        logger.info("Ejecutando comando de restauración")

        # Ejecutar el comando con el archivo como entrada
        with open(temp_filepath, 'r') as f:
            subprocess.run(command, stdin=f, check=True)
        logger.info("Backup restaurado exitosamente")

        # Limpiar archivo temporal
        os.remove(temp_filepath)
        logger.info("Archivo temporal eliminado")

        return RestoreResponse(
            message="Backup restaurado exitosamente",
            restored_at=datetime.now()
        )

    except Exception as e:
        error_msg = f"Error al restaurar el backup: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )
