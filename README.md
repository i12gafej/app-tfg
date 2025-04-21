# Sistema de Memorias de Sostenibilidad

Sistema web para la gestión de memorias de sostenibilidad con dos entornos: público y privado.

## Requisitos

- Python 3.8+
- PostgreSQL
- Node.js 14+
- npm o yarn

## Instalación

### Backend

1. Crear un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Inicializar la base de datos:
```bash
alembic upgrade head
```

5. Ejecutar el servidor:
```bash
uvicorn app.main:app --reload
```

### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Ejecutar el servidor de desarrollo:
```bash
npm start
```

## Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py
│   ├── api/v1/endpoints/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── dependencies/
├── alembic/
└── tests/

frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── routes/
│   ├── services/
│   └── styles/
└── package.json
```

## Roles de Usuario

- **Administrador**: Control total del sistema
- **Gestor de Sostenibilidad**: Gestiona memorias asignadas
- **Consultor**: Consulta memorias asignadas
- **Asesor Externo**: Consulta partes privadas asignadas
- **Usuario Público**: Acceso básico a funcionalidades públicas

## Documentación API

La documentación de la API está disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 