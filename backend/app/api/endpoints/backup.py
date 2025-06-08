from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.engine.url import make_url
from datetime import datetime
import os
import subprocess
import logging
import shutil
import io
import asyncio
import pymysql
from collections import defaultdict, deque

from app.config import settings
from app.api.deps import get_db, get_current_user
from app.schemas.backup import BackupResponse, RestoreResponse
from app.schemas.auth import TokenData


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)


formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)


logger.addHandler(console_handler)

router = APIRouter()

def find_mysqldump():
    """
    Busca la ruta del comando mysqldump
    """
    mysqldump_path = shutil.which("mysqlpump")
    if mysqldump_path:
        return mysqldump_path
    
    return "mysqldump"

def get_mysql_container_name():
    """
    Obtiene el nombre del contenedor de MySQL/MariaDB en ejecución
    """
    try:
        
        result = subprocess.run(
            ["docker", "ps", "--filter", "ancestor=mysql", "--format", "{{.Names}}"],
            capture_output=True, text=True, check=True
        )
        name = result.stdout.strip()
        if name:
            return name
        
        result = subprocess.run(
            ["docker", "ps", "--filter", "name=mysql", "--format", "{{.Names}}"],
            capture_output=True, text=True, check=True
        )
        name = result.stdout.strip()
        if name:
            return name
        
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
    """
    Crea un backup de la base de datos
    """
    try:
        logger.info(f"Iniciando creación de backup por usuario: {current_user.email}")
        
        
        db_url = make_url(settings.DATABASE_URL)
        user = db_url.username
        password = db_url.password
        host = db_url.host
        port = db_url.port or 3306
        database = db_url.database

        def _create_ordered_backup():
            
            logger.info("Conectando a MySQL para analizar dependencias...")
            conn = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                charset='utf8mb4'
            )
            
            try:
                
                cursor = conn.cursor()
                cursor.execute("SHOW TABLES")
                all_tables = [row[0] for row in cursor.fetchall()]
                logger.info(f"Tablas encontradas: {all_tables}")
                
                
                deps = get_dependency_graph(conn, database)
                logger.info(f"Dependencias encontradas: {deps}")
                
                
                for table in all_tables:
                    if table not in deps:
                        deps[table] = []
                
                
                ordered_tables = topo_sort(deps)
                logger.info(f"Orden de tablas: {ordered_tables}")
                
                
                backup_data = dump_data_only(host, port, user, password, database, ordered_tables)
                logger.info("Backup ordenado creado exitosamente")
                
                return backup_data
                
            finally:
                conn.close()

        
        backup_data = await asyncio.to_thread(_create_ordered_backup)

        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_data_{timestamp}.sql"

        
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
    """
    Restaura un backup de la base de datos
    """
    temp_file = None
    try:
        logger.info(f"Iniciando restauración de backup por usuario: {current_user.email}")
        logger.info(f"Archivo recibido: {file.filename}")

        
        if not file.filename.endswith('.sql'):
            error_msg = "El archivo debe ser un backup SQL válido"
            logger.error(error_msg)
            raise HTTPException(
                status_code=400,
                detail=error_msg
            )

        
        temp_file = f"/tmp/{file.filename}"
        with open(temp_file, "wb") as f:
            f.write(await file.read())
        logger.info(f"Archivo guardado en: {temp_file}")

        
        db_url = make_url(settings.DATABASE_URL)
        user = db_url.username
        password = db_url.password
        host = db_url.host
        port = db_url.port or 3306
        database = db_url.database

        def _restore():
            
            logger.info("Iniciando restauración de datos (sin tocar estructura)...")
            
            
            check_db_sql = f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{database}'"
            proc_check = subprocess.run(
                ["mysql", "-h", host, "-P", str(port),
                 "-u", user, f"-p{password}", "-e", check_db_sql],
                capture_output=True, text=True
            )
            
            if database not in proc_check.stdout:
                raise RuntimeError(f"La base de datos '{database}' no existe. Debe existir antes de restaurar datos.")
            
            logger.info(f"Base de datos '{database}' confirmada")
            
            
            conn = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                charset='utf8mb4'
            )
            
            try:
                cursor = conn.cursor()
                
                
                cursor.execute("SHOW TABLES")
                all_tables = [row[0] for row in cursor.fetchall()]
                logger.info(f"Tablas encontradas: {all_tables}")
                
                
                deps = get_dependency_graph(conn, database)
                logger.info(f"Dependencias encontradas: {deps}")
                
                
                for table in all_tables:
                    if table not in deps:
                        deps[table] = []
                
                
                ordered_tables = topo_sort(deps)
                logger.info(f"Orden de tablas: {ordered_tables}")
                
                
                logger.info("Configurando MySQL para restauración...")
                cursor.execute("SET FOREIGN_KEY_CHECKS=0")
                cursor.execute("SET UNIQUE_CHECKS=0")
                cursor.execute("SET AUTOCOMMIT=0")
                cursor.execute("START TRANSACTION")
                
                
                logger.info("=== PASO 1: Limpiando tablas (TRUNCATE) ===")
                logger.info(f"Orden para TRUNCATE (hijos → padres): {list(reversed(ordered_tables))}")
                for table in reversed(ordered_tables):
                    if table == 'users':
                        logger.info(f"DELETE FROM `{table}` (tabla especial)")
                        cursor.execute(f"DELETE FROM `{table}`")
                        logger.info(f"Tabla `{table}` limpiada con DELETE")
                    else:
                        logger.info(f"TRUNCATE TABLE `{table}`")
                        cursor.execute(f"TRUNCATE TABLE `{table}`")
                        logger.info(f"Tabla `{table}` limpiada con TRUNCATE")
                
                
                logger.info("=== PASO 2: Procesando archivo SQL ===")
                
                
                logger.info("=== VERIFICANDO ESTRUCTURA DE TABLAS ===")
                problematic_tables = ['diagnosis_indicators_quantitative', 'diagnosis_indicators_qualitative', 'performance_indicators_quantitative', 'performance_indicators_qualitative']
                
                for table in problematic_tables:
                    if table in all_tables:
                        cursor.execute(f"DESCRIBE `{table}`")
                        columns = cursor.fetchall()
                        column_names = [col[0] for col in columns]
                        logger.info(f"Tabla `{table}` tiene columnas: {column_names}")
                
                with open(temp_file, 'r', encoding='utf-8') as f:
                    sql_content = f.read()
                
                
                statements = []
                current_statement = ""
                in_comment = False
                in_string = False
                string_char = None
                
                for line in sql_content.split('\n'):
                    line = line.strip()
                    if not line or line.startswith('--'):
                        continue
                        
                    
                    if '/*!' in line:
                        in_comment = True
                    if '*/' in line:
                        in_comment = False
                        continue
                    if in_comment:
                        continue
                        
                    
                    for char in line:
                        if char in ['"', "'"] and not in_string:
                            in_string = True
                            string_char = char
                        elif char == string_char and in_string:
                            in_string = False
                            string_char = None
                            
                        current_statement += char
                        
                        if char == ';' and not in_string:
                            if current_statement.strip():
                                stmt = current_statement.strip()
                                
                                if stmt.upper().startswith('INSERT'):
                                    statements.append(stmt)
                            current_statement = ""
                
                
                logger.info(f"=== PASO 3: Ejecutando {len(statements)} INSERT statements ===")
                logger.info(f"Orden para INSERT (padres → hijos): {ordered_tables}")
                
                for i, stmt in enumerate(statements, 1):
                    
                    try:
                        if 'INSERT INTO' in stmt.upper():
                            table_part = stmt.split('INSERT INTO')[1].split('(')[0].strip()
                            table_name = table_part.replace('`', '').strip()
                        else:
                            table_name = "desconocida"
                        
                        logger.info(f"[{i}/{len(statements)}] Ejecutando INSERT en tabla `{table_name}`")
                        logger.info(f"Statement: {stmt[:200]}{'...' if len(stmt) > 200 else ''}")
                        
                        cursor.execute(stmt)
                        logger.info(f"INSERT {i} ejecutado correctamente en tabla `{table_name}`")
                        
                        
                        if i % 50 == 0:
                            conn.commit()
                            cursor.execute("START TRANSACTION")
                            logger.info(f"Commit realizado en statement {i}")
                            
                    except Exception as e:
                        logger.error(f"Error en INSERT {i}: {str(e)}")
                        logger.error(f"Statement problemático: {stmt}")
                        
                        
                        if "Unknown column" in str(e):
                            logger.warning(f"Saltando INSERT {i} por diferencia de esquema")
                            continue
                        else:
                            
                            raise
                
                
                conn.commit()
                cursor.execute("SET AUTOCOMMIT=1")
                cursor.execute("SET FOREIGN_KEY_CHECKS=1")
                cursor.execute("SET UNIQUE_CHECKS=1")
                
                logger.info("Restauración de datos completada exitosamente")
                
            finally:
                cursor.close()
                conn.close()

        
        await asyncio.to_thread(_restore)
        
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
    finally:
        
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
                logger.info("Archivo temporal eliminado")
            except Exception as e:
                logger.warning(f"No se pudo eliminar el archivo temporal: {e}")

def analyze_sql_file(path: str) -> None:
    """
    Analiza un archivo SQL y muestra sus statements
    """
    try:
        
        print(f"Leyendo archivo: {path}")
        with open(path, 'r', encoding='utf-8') as f:
            sql = f.read()
        print("Archivo leído correctamente")

        
        statements = []
        current_statement = ""
        in_comment = False
        in_string = False
        string_char = None
        
        for line in sql.split('\n'):
            line = line.strip()
            
            
            if not line:
                continue
                
            
            if line.startswith('--'):
                continue
                
            
            if '/*!' in line:
                in_comment = True
            if '*/' in line:
                in_comment = False
                continue
            if in_comment:
                continue
                
            
            for char in line:
                if char in ['"', "'"] and not in_string:
                    in_string = True
                    string_char = char
                elif char == string_char and in_string:
                    in_string = False
                    string_char = None
                    
                current_statement += char
                
                if char == ';' and not in_string:
                    if current_statement.strip():
                        statements.append(current_statement.strip())
                    current_statement = ""

        
        print(f"\nTotal de statements encontrados: {len(statements)}")
        print("\nPrimeros 5 statements:")
        for i, stmt in enumerate(statements[:5], 1):
            print(f"\n{i}. {stmt[:200]}...")

        print("\nÚltimos 5 statements:")
        for i, stmt in enumerate(statements[-5:], len(statements)-4):
            print(f"\n{i}. {stmt[:200]}...")

        
        print("\nBuscando statements específicos:")
        for i, stmt in enumerate(statements, 1):
            if "sustainability_team_members" in stmt:
                print(f"\nEncontrado en statement {i}:")
                print(stmt)

    except Exception as e:
        print(f"Error al analizar el archivo: {str(e)}")
        import traceback
        traceback.print_exc()

def get_dependency_graph(conn, database: str) -> dict[str, list[str]]:
    """
    Devuelve un diccionario {tabla: [tablas_de_las_que_depende]}.
    Se apoya en INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.
    """
    q = """
        SELECT rc.TABLE_NAME AS child,
               rc.REFERENCED_TABLE_NAME AS parent
        FROM information_schema.REFERENTIAL_CONSTRAINTS rc
        WHERE rc.CONSTRAINT_SCHEMA = %s;
    """
    cur = conn.cursor()
    cur.execute(q, (database,))
    deps: dict[str, list[str]] = {}
    for child, parent in cur.fetchall():
        deps.setdefault(child, []).append(parent)
        deps.setdefault(parent, [])  
    return deps

def topo_sort(deps: dict[str, list[str]]) -> list[str]:
    """Ordenamiento topológico: padres primero, hijos después"""
    
    reverse_deps = defaultdict(list)
    indeg = defaultdict(int)
    
    
    for table in deps:
        indeg[table] = 0
    
    
    for table, dependencies in deps.items():
        for dep in dependencies:
            reverse_deps[dep].append(table)  
            indeg[table] += 1  
    
    
    q = deque([table for table in deps if indeg[table] == 0])
    order = []

    while q:
        table = q.popleft()
        order.append(table)
        
        
        for dependent in reverse_deps[table]:
            indeg[dependent] -= 1
            if indeg[dependent] == 0:
                q.append(dependent)

    if len(order) != len(deps):
        raise RuntimeError("Ciclo en las dependencias → revísalo")
    
    return order  

def dump_data_only(host: str, port: int, user: str, password: str, database: str, ordered_tables: list[str]) -> bytes:
    """
    Crear dump solo de datos (INSERT) ordenado tabla por tabla
    """
    common = [
        "-h", host, "-P", str(port),
        "-u", user, f"-p{password}",
        "--single-transaction",
        "--no-create-info",  
        "--no-create-db",    
        "--skip-triggers",   
        "--skip-routines",   
        "--skip-events",     
        "--complete-insert", 
        "--extended-insert", 
        "--lock-tables=false", 
        database
    ]

    dump = bytearray()
    
    
    header = f"""-- MySQL data dump (solo datos)
-- Host: {host}    Database: {database}
-- ------------------------------------------------------
-- Dump de datos ordenado por dependencias

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Limpiar datos existentes antes de insertar
"""
    dump.extend(header.encode('utf-8'))
    
    
    for table in reversed(ordered_tables):
        logger.info(f"Agregando TRUNCATE para tabla: {table}")
        truncate_stmt = f"TRUNCATE TABLE `{table}`;\n"
        dump.extend(truncate_stmt.encode('utf-8'))
    
    dump.extend(b"\n-- Insertar datos en orden de dependencias\n\n")
    
    
    for table in ordered_tables:
        logger.info(f"Creando dump de datos para tabla: {table}")
        cmd = ["mysqldump"] + common + [table]
        try:
            res = subprocess.run(cmd, capture_output=True, check=True)
            table_data = res.stdout
            if table_data.strip():  
                dump.extend(f"-- Datos para tabla `{table}`\n".encode('utf-8'))
                dump.extend(table_data + b"\n\n")
            else:
                dump.extend(f"-- Tabla `{table}` sin datos\n\n".encode('utf-8'))
        except subprocess.CalledProcessError as e:
            logger.warning(f"Error al hacer dump de datos de tabla {table}: {e}")
            dump.extend(f"-- Error al obtener datos de tabla `{table}`\n\n".encode('utf-8'))
    
    
    footer = """/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump de datos completado
"""
    dump.extend(footer.encode('utf-8'))
    
    return bytes(dump)
