# 🗄️ Guía Completa de la Base de Datos SQLite

## 📍 Ubicación

Tu base de datos está en:
```
C:\Users\Acer\Desktop\chazas\Back\chazas.db
```

Es un **archivo único** de 24KB que contiene TODA tu base de datos.

---

## 🎯 ¿Por qué SQLite?

### Ventajas para tu proyecto:

✅ **Cero configuración**: No necesitas instalar nada adicional
✅ **Portátil**: Es solo un archivo, fácil de respaldar
✅ **Rápida**: Perfecta para desarrollo y apps pequeñas/medianas
✅ **Fácil de migrar**: Cuando crezcas, migras a PostgreSQL sin cambiar mucho código
✅ **Perfecta para aprender**: Ves los conceptos de BD sin complejidad adicional

### Limitaciones (importantes conocer):

⚠️ **Escrituras concurrentes limitadas**: Si muchos usuarios escriben a la vez, puede ser lenta
⚠️ **No tiene usuarios/permisos**: No hay control de acceso a nivel de BD
⚠️ **Tamaño máximo**: 140 TB (no es problema para tu MVP)
⚠️ **No es ideal para producción grande**: Para apps con miles de usuarios, mejor PostgreSQL

---

## 📊 Estructura de tu Base de Datos

### Tabla: `users` (Usuarios)

| Columna | Tipo | Obligatorio | Descripción |
|---------|------|-------------|-------------|
| `id` | INTEGER | ✅ (PK) | ID único del usuario |
| `nombre` | VARCHAR(100) | ✅ | Nombre completo |
| `email` | VARCHAR(255) | ✅ | Email único |
| `password_hash` | VARCHAR(255) | ✅ | Contraseña hasheada |
| `tipo_usuario` | VARCHAR(20) | ✅ | 'estudiante' o 'chazero' |
| `is_active` | BOOLEAN | ❌ | Si la cuenta está activa |
| `is_verified` | BOOLEAN | ❌ | Si verificó su email |
| `created_at` | DATETIME | ❌ | Fecha de registro |
| `updated_at` | DATETIME | ❌ | Última actualización |

**Ejemplo de datos**:
```
id=1, nombre="Juan Pérez", email="juan@mail.com", tipo_usuario="estudiante"
```

---

### Tabla: `chazas` (Trabajos)

| Columna | Tipo | Obligatorio | Descripción |
|---------|------|-------------|-------------|
| `id` | INTEGER | ✅ (PK) | ID único de la chaza |
| `titulo` | VARCHAR(200) | ✅ | Título del trabajo |
| `descripcion` | TEXT | ✅ | Descripción detallada |
| `categoria` | VARCHAR(50) | ✅ | Categoría (plomería, etc.) |
| `precio` | FLOAT | ❌ | Precio del servicio |
| `ubicacion` | VARCHAR(200) | ✅ | Dónde se realiza |
| `duracion_estimada` | VARCHAR(50) | ❌ | Tiempo estimado |
| `owner_id` | INTEGER | ✅ (FK) | ID del chazero que creó |
| `is_active` | BOOLEAN | ❌ | Si está disponible |
| `is_completed` | BOOLEAN | ❌ | Si ya se completó |
| `created_at` | DATETIME | ❌ | Fecha de creación |
| `updated_at` | DATETIME | ❌ | Última actualización |

**Ejemplo de datos**:
```
id=1, titulo="Reparar grifo", categoria="plomería", precio=50.0, owner_id=2
```

---

## 🔧 ¿Cómo se inicializó la base de datos?

### Automáticamente al iniciar el servidor! 🎉

Cuando ejecutaste `uvicorn app.main:app`, esto pasó:

1. **FastAPI inició** → Ejecutó `on_startup()` en [main.py](app/main.py:40)
2. **Llamó a `init_db()`** → En [database/session.py](app/database/session.py:47)
3. **SQLAlchemy leyó los modelos** → [models/user.py](app/models/user.py) y [models/chaza.py](app/models/chaza.py)
4. **Creó las tablas automáticamente** → Con `Base.metadata.create_all()`

**NO necesitas inicializar manualmente**. Se hace solo cuando arranca el servidor.

---

## 📂 ¿Puedo cargar datos manualmente?

### ¡Sí! Tienes 3 formas:

### **Opción 1: Con tu API (Recomendado)** ✅

Usa Swagger UI para agregar datos desde el navegador:
```
http://localhost:8000/docs
```

1. Ve a POST `/api/v1/auth/register`
2. Click "Try it out"
3. Llena los datos
4. Click "Execute"
5. ¡Datos guardados en la BD!

---

### **Opción 2: Con DB Browser for SQLite** 🖥️

**Descarga**: https://sqlitebrowser.org/dl/

1. Descarga e instala DB Browser
2. Abre el archivo `chazas.db`
3. Ve a pestaña "Browse Data"
4. Puedes agregar/editar/eliminar registros manualmente
5. Click "Write Changes" para guardar

**Captura de ejemplo** (así se ve):
```
┌─────────────────────────────────────┐
│ DB Browser for SQLite               │
├─────────────────────────────────────┤
│ Tabla: users                        │
│ ┌────┬───────────┬──────────────┐   │
│ │ id │ nombre    │ email        │   │
│ ├────┼───────────┼──────────────┤   │
│ │ 1  │ Juan      │ juan@mail.com│   │
│ │ 2  │ María     │ maria@mail.co│   │
│ └────┴───────────┴──────────────┘   │
└─────────────────────────────────────┘
```

---

### **Opción 3: Con script Python** 🐍

Creé el script `ver_bd.py` para que veas la estructura. Puedes modificarlo para agregar datos:

```bash
cd Back
venv/Scripts/python ver_bd.py
```

---

## 📏 ¿Tiene límite de tamaño?

### Límites técnicos de SQLite:

| Característica | Límite | ¿Es problema? |
|---------------|---------|---------------|
| **Tamaño máximo de BD** | 140 TB | ❌ No, tu app usará MB |
| **Tamaño máximo de fila** | 1 GB | ❌ No |
| **Número de tablas** | 2,147,483,646 | ❌ No |
| **Columnas por tabla** | 32,767 | ❌ No |
| **Registros por tabla** | Ilimitado | ✅ Sí, si tu app crece mucho |

### Para tu MVP (Producto Mínimo Viable):

✅ **SQLite es PERFECTA** si tienes:
- Menos de 100,000 usuarios
- Menos de 1 millón de chazas
- Tráfico moderado (no viral)

⚠️ **Deberías migrar a PostgreSQL** si:
- Tienes más de 100,000 usuarios activos
- Múltiples servidores escribiendo simultáneamente
- Tráfico muy alto (miles de peticiones por segundo)

---

## 🌐 Diferencia: Local vs Producción

### 🏠 **Local (Desarrollo)** - Lo que tienes ahora:

```
Tu computadora
├── Backend (puerto 8000)
├── chazas.db (archivo local)
└── Frontend (puerto 3000)
```

**Características**:
- ✅ Base de datos en tu disco duro
- ✅ Solo tú puedes acceder
- ✅ Rápido para probar
- ❌ Si borras el archivo, pierdes todo
- ❌ Nadie más puede usar tu app

---

### ☁️ **Producción (Deployed)** - Cuando publiques:

```
Servidor en la nube (ej: Render, Railway, AWS)
├── Backend (dominio: api.chazas.com)
├── Base de datos (PostgreSQL en servidor aparte)
└── Frontend (dominio: chazas.com)
```

**Características**:
- ✅ Accesible desde internet
- ✅ Base de datos en servidor separado
- ✅ Backups automáticos
- ✅ Múltiples usuarios simultáneos
- ✅ Escalable

---

## 🚀 Migración de SQLite a PostgreSQL

Cuando estés listo para producción, la migración es FÁCIL con tu arquitectura:

### Solo cambias 1 línea en `.env`:

```bash
# SQLite (desarrollo)
DATABASE_URL=sqlite:///./chazas.db

# PostgreSQL (producción)
DATABASE_URL=postgresql://user:pass@host:5432/chazas
```

**El resto del código NO CAMBIA** gracias a SQLAlchemy! 🎉

---

## 🔍 Comandos útiles para tu BD

### Ver estructura de la BD:
```bash
cd Back
venv/Scripts/python ver_bd.py
```

### Ver cuántos registros hay:
```bash
cd Back
venv/Scripts/python -c "import sqlite3; conn = sqlite3.connect('chazas.db'); c = conn.cursor(); c.execute('SELECT COUNT(*) FROM users'); print('Usuarios:', c.fetchone()[0])"
```

### Hacer backup de la BD:
```bash
cd Back
copy chazas.db chazas_backup_2026-01-14.db
```

### Resetear la BD (borrar todos los datos):
```bash
cd Back
del chazas.db
# Al reiniciar el servidor, se creará vacía de nuevo
```

---

## 🧪 Probemos tu BD - Registrar primer usuario

### Opción A: Con Swagger UI (Visual)

1. Abre: http://localhost:8000/docs
2. Ve a `POST /api/v1/auth/register`
3. Click "Try it out"
4. Copia este JSON:
```json
{
  "nombre": "Tu Nombre",
  "email": "tu@email.com",
  "password": "123456",
  "tipo_usuario": "estudiante"
}
```
5. Click "Execute"
6. ¡Listo! Usuario guardado en `chazas.db`

### Opción B: Con curl (Línea de comandos)

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Tu Nombre",
    "email": "tu@email.com",
    "password": "123456",
    "tipo_usuario": "estudiante"
  }'
```

Luego verifica con:
```bash
cd Back
venv/Scripts/python ver_bd.py
```

---

## 📚 Conceptos Clave de Bases de Datos

### 🔑 Primary Key (PK) - Llave Primaria
- Es el ID único de cada registro
- En `users`: El `id` identifica cada usuario
- **Nunca se repite**

### 🔗 Foreign Key (FK) - Llave Foránea
- Conecta dos tablas
- En `chazas`: `owner_id` apunta a un `user.id`
- Ejemplo: Chaza #5 fue creada por Usuario #2

### 🔒 Índices (Indexes)
- Hacen las búsquedas más rápidas
- Tu `email` tiene índice → buscar por email es rápido

### 💾 Persistencia
- Los datos NO se borran cuando apagas el servidor
- Están guardados en el archivo `chazas.db`

---

## ⚠️ Importante: .gitignore

**NO versiones el archivo `.db` en Git**. Ya está en `.gitignore`:

```gitignore
*.db
*.sqlite
*.sqlite3
```

**¿Por qué?**
- La BD cambia constantemente
- Puede tener datos sensibles
- Ocupa espacio en Git
- Cada desarrollador debe tener su propia BD local

---

## 🎯 Resumen

| Pregunta | Respuesta |
|----------|-----------|
| **¿Dónde está?** | `Back/chazas.db` |
| **¿Por qué SQLite?** | Fácil, portátil, perfecta para aprender |
| **¿Se inicializa automáticamente?** | ✅ Sí, al arrancar el servidor |
| **¿Puedo agregar datos manualmente?** | ✅ Sí, con Swagger UI o DB Browser |
| **¿Tiene límite?** | 140 TB (no es problema) |
| **¿Diferencia local vs producción?** | Local usa archivo, producción usa servidor |
| **¿Puedo ver los datos?** | ✅ Sí, con `ver_bd.py` o DB Browser |
| **¿Puedo hacer backup?** | ✅ Sí, solo copia el archivo `.db` |

---

¿Quieres que ahora abramos Swagger y registremos tu primer usuario para ver cómo se guarda en la BD?