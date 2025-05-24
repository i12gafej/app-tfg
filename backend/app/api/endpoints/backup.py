from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.engine.url import make_url
from datetime import datetime
import os
import subprocess
import logging
from typing import Optional
import shutil
import io
import asyncio

from app.config import settings
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

def find_mysqldump():
    mysqldump_path = shutil.which("mysqldump")
    if mysqldump_path:
        return mysqldump_path
    # Puedes agregar aquí búsqueda recursiva si lo deseas
    return "mysqldump"

def get_mysql_container_name():
    try:
        # Buscar contenedor por imagen mysql
        result = subprocess.run(
            ["docker", "ps", "--filter", "ancestor=mysql", "--format", "{{.Names}}"],
            capture_output=True, text=True, check=True
        )
        name = result.stdout.strip()
        if name:
            return name
        # Si no, buscar por nombre parcial
        result = subprocess.run(
            ["docker", "ps", "--filter", "name=mysql", "--format", "{{.Names}}"],
            capture_output=True, text=True, check=True
        )
        name = result.stdout.strip()
        if name:
            return name
        # Si no, buscar por imagen mariadb
        result = subprocess.run(
            ["docker", "ps", "--filter", "ancestor=mariadb", "--format", "{{.Names}}"],
            capture_output=True, text=True, check=True
        )
        name = result.stdout.strip()
        if name:
            return name
        raise Exception("No se encontró un contenedor de MySQL/MariaDB en ejecución.")
    except Exception as e:
        raise Exception(f"No se pudo obtener el nombre del contenedor: {e}")

@router.post("/backup/create")
async def create_backup(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Iniciando creación de backup por usuario: {current_user.email}")

        # Extraer datos de la DATABASE_URL
        db_url = make_url(settings.DATABASE_URL)
        user = db_url.username
        password = db_url.password
        host = db_url.host
        port = db_url.port or 3306
        database = db_url.database

        # 1. Intentar mysqldump directamente
        mysqldump_exe = find_mysqldump()
        command_direct = [
            mysqldump_exe,
            "-h", host,
            "-P", str(port),
            "-u", user,
            f"-p{password}",
            database
        ]
        logger.info(f"Intentando backup con: {' '.join(command_direct)}")
        try:
            result = subprocess.run(command_direct, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            backup_data = result.stdout
            logger.info("Backup creado exitosamente con mysqldump directo")
        except Exception as e1:
            logger.warning(f"mysqldump directo falló: {e1}")
            # 2. Intentar con Docker
            mysql_container = get_mysql_container_name()
            command_docker = [
                "docker", "exec", mysql_container, "mysqldump",
                "-u", user,
                f"-p{password}",
                database
            ]
            logger.info(f"Intentando backup con Docker: {' '.join(command_docker)}")
            try:
                result = subprocess.run(command_docker, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
                backup_data = result.stdout
                logger.info("Backup creado exitosamente con Docker")
            except Exception as e2:
                error_msg = f"Error al crear el backup: mysqldump directo: {e1} | Docker: {e2}"
                logger.error(error_msg, exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=error_msg
                )

        # Nombre del archivo para la descarga
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.sql"

        # Devolver el backup como un stream (no se guarda en disco)
        return StreamingResponse(
            io.BytesIO(backup_data),
            media_type='application/sql',
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
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

        # Leer el contenido del archivo en memoria
        content = await file.read()

        # Extraer datos de la DATABASE_URL
        db_url = make_url(settings.DATABASE_URL)
        user = db_url.username
        password = db_url.password
        host = db_url.host
        port = db_url.port or 3306
        database = db_url.database

        # Comando para restaurar el backup usando el cliente mysql directamente
        mysql_exe = shutil.which("mysql") or "mysql"
        command = [
            mysql_exe,
            "-h", host,
            "-P", str(port),
            "-u", user,
            f"-p{password}",
            database
        ]
        logger.info(f"Ejecutando comando de restauración: {' '.join(command)}")

        # Ejecutar el comando de forma asíncrona usando asyncio
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        # Enviar el contenido del backup al proceso y esperar su finalización
        stdout, stderr = await process.communicate(input=content)

        if process.returncode != 0:
            error_msg = f"Error al restaurar el backup: {stderr.decode()}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)

        logger.info("Backup restaurado exitosamente")

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
