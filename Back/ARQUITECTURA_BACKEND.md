# Arquitectura Completa del Backend - Chazas

## 🎯 Visión General

Tu backend sigue el patrón **MVC adaptado para APIs REST**:

```
Cliente (React)
    ↓ HTTP Request
FastAPI (main.py)
    ↓ Rutea la petición
Routes (endpoints)
    ↓ Lógica de negocio
Models (SQLAlchemy)
    ↓ Consultas SQL
Database (SQLite)
    ↓ Datos
```

---

## 📂 Estructura de Carpetas Explicada

```
Back/
├── app/
│   ├── __init__.py           # Hace que 'app' sea un módulo Python
│   ├── main.py               # 🚀 PUNTO DE ENTRADA - Arranca FastAPI
│   │
│   ├── core/                 # ⚙️ CONFIGURACIÓN GLOBAL
│   │   ├── __init__.py
│   │   ├── config.py         # Variables de entorno (.env)
│   │   └── security.py       # JWT, hash de contraseñas
│   │
│   ├── database/             # 🗄️ BASE DE DATOS
│   │   ├── __init__.py
│   │   └── session.py        # Conexión a SQLite, sesiones
│   │
│   ├── models/               # 📊 MODELOS (Tablas)
│   │   ├── __init__.py
│   │   ├── user.py           # Tabla 'users'
│   │   └── chaza.py          # Tabla 'chazas'
│   │
│   ├── schemas/              # 📋 VALIDACIÓN (Pydantic)
│   │   ├── __init__.py
│   │   ├── user.py           # Validar datos de usuarios
│   │   └── chaza.py          # Validar datos de chazas
│   │
│   ├── routes/               # 🛣️ ENDPOINTS (APIs)
│   │   ├── __init__.py
│   │   ├── auth.py           # Login, registro, logout
│   │   └── chazas.py         # CRUD de chazas
│   │
│   └── dependencies/         # 🔒 MIDDLEWARES
│       ├── __init__.py
│       └── auth.py           # Verificar token JWT
│
├── uploads/                  # 📁 IMÁGENES (filesystem)
│   ├── usuarios/
│   └── chazas/
│
├── chazas.db                 # 🗄️ BASE DE DATOS SQLite
├── .env                      # 🔐 VARIABLES DE ENTORNO
├── requirements.txt          # 📦 DEPENDENCIAS
└── ver_bd.py                 # 🔍 SCRIPT AUXILIAR
```

---

## 🔄 Flujo de una Petición Completa

Veamos qué pasa cuando el frontend hace login:

```
1. FRONTEND (React)
   │
   └─> POST http://localhost:8000/api/v1/auth/login
       Body: { "email": "pablo@ejemplo.com", "password": "123456" }
       │
       ↓

2. MAIN.PY (FastAPI)
   │
   ├─> Lee la petición
   ├─> Busca la ruta /api/v1/auth/login
   └─> Redirige a routes/auth.py
       │
       ↓

3. ROUTES/AUTH.PY (Endpoint)
   │
   ├─> Recibe { email, password }
   ├─> Valida con schemas/user.py (Pydantic)
   ├─> Busca usuario en la DB con models/user.py
   │   │
   │   └─> DATABASE/SESSION.PY
   │       │
   │       └─> SQLITE (chazas.db)
   │           SELECT * FROM users WHERE email = "pablo@ejemplo.com"
   │           ↓
   │           Retorna: User(id=2, nombre="Pablo", password_hash="$2b$12...")
   │
   ├─> Verifica password con core/security.py
   ├─> Genera token JWT con core/security.py
   └─> Retorna: { "access_token": "eyJ0eXAi...", "token_type": "bearer" }
       │
       ↓

4. FRONTEND (React)
   │
   └─> Guarda token en localStorage
       └─> Usa token para peticiones futuras
```

---

## 📚 Explicación Archivo por Archivo

### 1. `app/main.py` - El Cerebro

**Propósito**: Punto de entrada, configuración de FastAPI

```python
from fastapi import FastAPI
from app.database.session import init_db
from app.routes import auth, chazas

# Crear aplicación
app = FastAPI(
    title="Chazas API",
    version="1.0.0"
)

# Evento al iniciar
@app.on_event("startup")
async def startup():
    init_db()  # Crear tablas si no existen

# Incluir rutas
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chazas.router, prefix="/api/v1/chazas", tags=["chazas"])

# Endpoint de prueba
@app.get("/")
def root():
    return {"message": "API de Chazas funcionando"}
```

**Responsabilidades**:
- ✅ Crear la app de FastAPI
- ✅ Inicializar la base de datos
- ✅ Registrar las rutas (endpoints)
- ✅ Configurar CORS (para que React pueda conectarse)

---

### 2. `app/core/config.py` - Variables de Entorno

**Propósito**: Leer variables del archivo `.env`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "sqlite:///./chazas.db"

    # JWT
    SECRET_KEY: str = "tu-clave-secreta-super-segura"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
```

**¿Por qué es importante?**
- ❌ NO hardcodeas secretos en el código
- ✅ Puedes cambiar configuración sin tocar código
- ✅ Diferente config para desarrollo/producción

---

### 3. `app/core/security.py` - Seguridad

**Propósito**: Hash de contraseñas, JWT

```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings

# Hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Crear token JWT"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

**Funciones clave**:
- `hash_password()`: Convierte "123456" → "$2b$12$eKat..."
- `verify_password()`: Compara contraseña ingresada con hash
- `create_access_token()`: Genera token JWT para autenticación

---

### 4. `app/database/session.py` - Conexión a DB

**Propósito**: Configurar SQLAlchemy, conexión a SQLite

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Crear engine (conexión)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

# Crear sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

def get_db():
    """Dependencia para obtener sesión de DB"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Crear todas las tablas"""
    from app.models import user, chaza  # Importar modelos
    Base.metadata.create_all(bind=engine)
```

**Conceptos importantes**:
- `engine`: La conexión a la base de datos
- `SessionLocal`: Crea sesiones para hacer consultas
- `Base`: Clase base para definir modelos
- `get_db()`: Función que da una sesión y la cierra automáticamente

---

### 5. `app/models/user.py` - Modelo de Usuario

**Propósito**: Definir la tabla `users`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    tipo_usuario = Column(String(20), nullable=False)  # 'estudiante' o 'chazero'
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Traducción a SQL**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

---

### 6. `app/schemas/user.py` - Validación de Datos

**Propósito**: Validar datos que vienen del frontend

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """Schema para crear usuario"""
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    tipo_usuario: str = Field(..., pattern="^(estudiante|chazero)$")

class UserResponse(BaseModel):
    """Schema para retornar usuario (SIN password)"""
    id: int
    nombre: str
    email: str
    tipo_usuario: str
    is_active: bool

    class Config:
        from_attributes = True  # Para convertir modelo SQLAlchemy a Pydantic

class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str
```

**¿Por qué usar Schemas?**
- ✅ Valida automáticamente (email válido, password mínimo 6 chars)
- ✅ Documenta la API (Swagger UI muestra qué campos son requeridos)
- ✅ Separa modelo de DB de respuestas (NO envías password_hash al frontend)

---

### 7. `app/routes/auth.py` - Endpoints de Autenticación

**Propósito**: Login, registro, logout

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registrar nuevo usuario"""
    # Verificar si email ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # Crear usuario
    new_user = User(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        tipo_usuario=user_data.tipo_usuario
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Iniciar sesión"""
    # Buscar usuario
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # Verificar contraseña
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # Crear token
    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }
```

**Flujo de registro**:
1. Frontend envía { nombre, email, password, tipo_usuario }
2. Backend valida con `UserCreate` schema
3. Verifica que email no exista
4. Hashea la contraseña
5. Guarda en DB
6. Retorna usuario (sin password)

**Flujo de login**:
1. Frontend envía { email, password }
2. Backend busca usuario por email
3. Verifica contraseña hasheada
4. Genera token JWT
5. Retorna { access_token, user }

---

### 8. `app/dependencies/auth.py` - Middleware de Autenticación

**Propósito**: Verificar que el usuario esté logueado

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.core.config import settings

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Obtener usuario actual desde el token JWT"""
    token = credentials.credentials

    try:
        # Decodificar token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Buscar usuario
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return user
```

**Uso en endpoints**:
```python
@router.get("/perfil")
def get_perfil(current_user: User = Depends(get_current_user)):
    """Endpoint protegido - solo usuarios logueados"""
    return {"nombre": current_user.nombre, "email": current_user.email}
```

---

## 🔗 Conexión Frontend → Backend

### En el Frontend (React):

```javascript
// 1. REGISTRO
async function registrar(nombre, email, password, tipo) {
  const response = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: nombre,
      email: email,
      password: password,
      tipo_usuario: tipo
    })
  });

  const data = await response.json();
  console.log('Usuario creado:', data);
}

// 2. LOGIN
async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  // Guardar token
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

// 3. PETICIÓN AUTENTICADA (ejemplo: ver perfil)
async function getPerfil() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:8000/api/v1/users/perfil', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // ← Enviar token
    }
  });

  const data = await response.json();
  return data;
}
```

---

## 📝 Resumen de Responsabilidades

| Archivo | ¿Qué hace? | Ejemplo |
|---------|-----------|---------|
| `main.py` | Arranca FastAPI, registra rutas | `app.include_router(auth.router)` |
| `config.py` | Lee variables de `.env` | `DATABASE_URL`, `SECRET_KEY` |
| `security.py` | Hash passwords, crea JWT | `hash_password("123456")` |
| `session.py` | Conexión a SQLite | `engine`, `SessionLocal` |
| `models/user.py` | Define tabla `users` | `class User(Base)` |
| `schemas/user.py` | Valida datos del frontend | `UserCreate`, `UserResponse` |
| `routes/auth.py` | Endpoints login/register | `/api/v1/auth/login` |
| `dependencies/auth.py` | Verifica JWT en endpoints protegidos | `Depends(get_current_user)` |

---

## 🎯 Próximos Pasos

Ahora que entiendes la arquitectura, vamos a:

1. **Revisar cada archivo actual** para ver qué falta
2. **Completar endpoints faltantes** (CRUD de chazas, perfil de usuario)
3. **Conectar el frontend** (reemplazar localStorage fake por API real)
4. **Implementar upload de imágenes**

¿Quieres que empecemos revisando archivo por archivo para ver qué hay implementado y qué falta?