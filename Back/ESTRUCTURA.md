# 📁 Estructura del Backend - Chazas API

```
Back/
│
├── 📄 .env                          ← Variables de entorno (secretas)
├── 📄 .env.example                  ← Plantilla de variables
├── 📄 .gitignore                    ← Archivos a ignorar en Git
├── 📄 requirements.txt              ← Dependencias Python
├── 📄 README.md                     ← Documentación del proyecto
├── 📄 run.bat                       ← Script para iniciar servidor
├── 📄 ESTRUCTURA.md                 ← Este archivo
│
└── 📁 app/                          ← Aplicación principal
    │
    ├── 📄 __init__.py
    ├── 📄 main.py                   ← ⭐ Punto de entrada FastAPI
    ├── 📄 config.py                 ← ⚙️ Configuraciones globales
    │
    ├── 📁 core/                     ← 🔐 Funciones base (seguridad)
    │   ├── __init__.py
    │   └── security.py              ← Hash passwords, JWT
    │
    ├── 📁 database/                 ← 💾 Base de datos
    │   ├── __init__.py
    │   └── session.py               ← Conexión SQLAlchemy
    │
    ├── 📁 models/                   ← 📊 Modelos (Tablas SQL)
    │   ├── __init__.py
    │   ├── user.py                  ← Tabla 'users'
    │   └── chaza.py                 ← Tabla 'chazas'
    │
    ├── 📁 schemas/                  ← ✅ Validación Pydantic
    │   ├── __init__.py
    │   ├── user.py                  ← UserCreate, UserLogin, Token
    │   └── chaza.py                 ← ChazaCreate, ChazaUpdate
    │
    ├── 📁 services/                 ← 🧠 Lógica de negocio
    │   ├── __init__.py
    │   ├── auth_service.py          ← Login, registro
    │   └── chaza_service.py         ← CRUD de chazas
    │
    └── 📁 api/                      ← 🌐 Rutas y endpoints
        ├── __init__.py
        ├── deps.py                  ← Dependencias (autenticación)
        └── routes/
            ├── __init__.py
            ├── auth.py              ← POST /register, /login
            └── chazas.py            ← CRUD /chazas
```

## 🔄 Flujo de una petición HTTP

```
Cliente (Frontend)
    ↓
    📡 HTTP Request
    ↓
main.py (FastAPI app)
    ↓
api/routes/ (Endpoint)
    ↓
api/deps.py (Autenticación JWT)
    ↓
services/ (Lógica de negocio)
    ↓
models/ (Acceso a base de datos)
    ↓
database/session.py (SQLAlchemy)
    ↓
💾 Base de datos SQLite
    ↓
    📡 HTTP Response
    ↓
Cliente (Frontend)
```

## 📚 Descripción de cada capa

### 🔐 **core/** - Seguridad
Funciones reutilizables de seguridad:
- `get_password_hash()` - Hashear contraseñas
- `verify_password()` - Verificar contraseñas
- `create_access_token()` - Crear tokens JWT
- `decode_access_token()` - Decodificar tokens

### 💾 **database/** - Base de datos
- `get_db()` - Dependencia para obtener sesión de BD
- `init_db()` - Crear tablas al iniciar

### 📊 **models/** - Modelos SQLAlchemy
Define las tablas en la base de datos:
- `User` - Tabla de usuarios (estudiantes y chazeros)
- `Chaza` - Tabla de chazas (trabajos publicados)

### ✅ **schemas/** - Validación Pydantic
Define qué datos son válidos en requests/responses:
- Request: Lo que el frontend envía
- Response: Lo que el backend devuelve

### 🧠 **services/** - Lógica de negocio
Contiene toda la lógica de la aplicación:
- `AuthService` - Registro, login, verificación
- `ChazaService` - Crear, leer, actualizar, eliminar chazas

**IMPORTANTE**: Los services son REUTILIZABLES en otros proyectos.

### 🌐 **api/** - Rutas HTTP
Define los endpoints de la API:
- `auth.py` - `/api/v1/auth/register`, `/login`, `/me`
- `chazas.py` - `/api/v1/chazas/` (CRUD completo)
- `deps.py` - `get_current_user()`, `get_current_chazero()`

## 🎯 Ventajas de esta estructura

1. **Separación de responsabilidades**: Cada carpeta tiene un propósito claro
2. **Reutilizable**: Los services y core se pueden copiar a otros proyectos
3. **Testeable**: Fácil escribir tests para cada capa
4. **Escalable**: Agregar features = crear nuevos archivos
5. **Mantenible**: Código organizado y fácil de encontrar

## 🚀 Próximos pasos para escalar

Cuando el proyecto crezca, puedes agregar:
- `app/utils/` - Utilidades genéricas
- `app/middleware/` - Middleware custom
- `tests/` - Tests unitarios y de integración
- `alembic/` - Migraciones de base de datos
- `app/models/propuesta.py` - Nuevo modelo
- `app/services/propuesta_service.py` - Nuevo servicio
- `app/api/routes/propuestas.py` - Nuevas rutas