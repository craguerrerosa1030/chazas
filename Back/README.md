# Chazas Backend API

API REST para la plataforma Chazas - Conectando estudiantes con oportunidades de trabajo.

## Estructura del Proyecto

```
Back/
├── app/
│   ├── main.py              # Punto de entrada FastAPI
│   ├── config.py            # Configuraciones
│   ├── core/                # Seguridad y utilidades base
│   ├── database/            # Conexión a base de datos
│   ├── models/              # Modelos SQLAlchemy (tablas)
│   ├── schemas/             # Validación Pydantic
│   ├── services/            # Lógica de negocio
│   └── api/                 # Rutas y endpoints
├── .env                     # Variables de entorno (NO versionar)
├── .env.example             # Plantilla de variables
└── requirements.txt         # Dependencias Python
```

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
```

2. Activar entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

## Ejecutar el servidor

```bash
# Desarrollo (con auto-reload)
uvicorn app.main:app --reload --port 8000

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

La API estará disponible en: http://localhost:8000

Documentación interactiva: http://localhost:8000/docs

## Tecnologías

- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para base de datos
- **Pydantic**: Validación de datos
- **JWT**: Autenticación con tokens
- **SQLite**: Base de datos (fácil migrar a PostgreSQL)