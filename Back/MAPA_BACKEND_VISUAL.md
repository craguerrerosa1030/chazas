# MAPA VISUAL DEL BACKEND - CHAZAS
## Para imprimir y tachar componente a componente

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🏭 FÁBRICA BACKEND - CHAZAS                               ║
║                                                                              ║
║   Cliente (Frontend) ──► Fábrica (FastAPI) ──► Almacén (SQLite)             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## MÓDULO 1: CONFIGURACIÓN (Setup)
**Función**: Preparar el entorno antes de arrancar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 1: CONFIGURACIÓN                                                    │
│  Función: Preparar el entorno antes de arrancar                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 1.1: Variables de entorno                                   │
│      Archivo: .env                                                          │
│      Hace: Guarda secretos y configuraciones                                │
│      Contiene: DATABASE_URL, SECRET_KEY, CORS_ORIGINS, PORT                 │
│                                                                             │
│  [ ] COMPONENTE 1.2: Lector de configuración                                │
│      Archivo: app/config.py                                                 │
│      Hace: Lee .env y expone variables como objeto Python                   │
│      Usa: Pydantic BaseSettings para validar                                │
│                                                                             │
│  [ ] COMPONENTE 1.3: Punto de entrada                                       │
│      Archivo: app/main.py                                                   │
│      Hace: Arranca FastAPI, conecta rutas, configura CORS                   │
│      Importante: Aquí se "prenden las máquinas"                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Encender las máquinas y configurar las líneas de producción

---

## MÓDULO 2: SEGURIDAD (Security)
**Función**: Verificar identidad y proteger accesos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 2: SEGURIDAD                                                        │
│  Función: Verificar identidad y proteger accesos                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 2.1: Herramientas de seguridad                              │
│      Archivo: app/core/security.py                                          │
│      Hace: Funciones para hash y JWT                                        │
│      Funciones:                                                             │
│        • hash_password()      → Convierte "123456" en "$2b$12$abc..."       │
│        • verify_password()    → Compara password ingresada con hash         │
│        • create_access_token()→ Genera token JWT (credencial temporal)      │
│        • decode_access_token()→ Verifica y decodifica JWT                   │
│                                                                             │
│  [ ] COMPONENTE 2.2: Guardias de acceso (Middlewares)                       │
│      Archivo: app/api/deps.py                                               │
│      Hace: Verifica permisos antes de ejecutar endpoints                    │
│      Funciones:                                                             │
│        • get_db()             → Abre conexión a DB, la cierra al final      │
│        • get_current_user()   → Extrae usuario del token JWT                │
│        • get_current_chazero()→ Verifica que sea chazero (no estudiante)    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Guardias de seguridad y sistema de credenciales

---

## MÓDULO 3: BASE DE DATOS (Data Layer)
**Función**: Conexión y estructura del almacén de datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 3: BASE DE DATOS                                                    │
│  Función: Conexión y estructura del almacén de datos                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 3.1: Conexión a SQLite                                      │
│      Archivo: app/database/session.py                                       │
│      Hace: Establece y gestiona conexiones a la DB                          │
│      Elementos:                                                             │
│        • engine          → Cable de conexión a SQLite                       │
│        • SessionLocal    → Crea "conversaciones" con la DB                  │
│        • get_db()        → Abre sesión, la usa, la cierra                   │
│        • init_db()       → Crea tablas si no existen                        │
│        • Base            → Clase padre de todos los modelos                 │
│                                                                             │
│  [ ] COMPONENTE 3.2: Modelo de Usuario                                      │
│      Archivo: app/models/user.py                                            │
│      Hace: Define estructura de tabla "users"                               │
│      Columnas:                                                              │
│        • id              → Identificador único (autoincremental)            │
│        • nombre          → Nombre completo                                  │
│        • email           → Email único (no se puede repetir)                │
│        • password_hash   → Contraseña hasheada (NUNCA texto plano)          │
│        • tipo_usuario    → "estudiante" o "chazero"                         │
│        • is_active       → ¿Usuario activo? (soft delete)                   │
│        • is_verified     → ¿Email verificado?                               │
│        • created_at      → Fecha de creación                                │
│        • updated_at      → Fecha de última modificación                     │
│                                                                             │
│  [ ] COMPONENTE 3.3: Modelo de Chaza                                        │
│      Archivo: app/models/chaza.py                                           │
│      Hace: Define estructura de tabla "chazas"                              │
│      Columnas:                                                              │
│        • id              → Identificador único                              │
│        • titulo          → Título del trabajo                               │
│        • descripcion     → Descripción detallada                            │
│        • categoria       → Tipo de trabajo (plomería, etc.)                 │
│        • precio          → Precio del servicio (opcional)                   │
│        • ubicacion       → Dónde se realiza                                 │
│        • duracion_estimada→ Tiempo estimado (opcional)                      │
│        • owner_id        → ID del chazero dueño (LLAVE FORÁNEA)             │
│        • is_active       → ¿Chaza disponible?                               │
│        • is_completed    → ¿Trabajo terminado?                              │
│        • created_at      → Fecha de creación                                │
│        • updated_at      → Fecha de modificación                            │
│                                                                             │
│      RELACIÓN: owner_id ──► users.id (cada chaza pertenece a 1 usuario)     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Planos de los estantes del almacén

---

## MÓDULO 4: VALIDACIÓN (Schemas)
**Función**: Control de calidad de datos entrantes y salientes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 4: VALIDACIÓN                                                       │
│  Función: Control de calidad de datos entrantes y salientes                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 4.1: Schemas de Usuario                                     │
│      Archivo: app/schemas/user.py                                           │
│      Hace: Valida datos de usuarios                                         │
│      Schemas:                                                               │
│        • UserCreate      → Qué necesito para REGISTRAR                      │
│          - nombre (min 2 chars)                                             │
│          - email (formato válido)                                           │
│          - password (min 6 chars)                                           │
│          - tipo_usuario ("estudiante" o "chazero")                          │
│                                                                             │
│        • UserLogin       → Qué necesito para LOGIN                          │
│          - email                                                            │
│          - password                                                         │
│                                                                             │
│        • UserResponse    → Qué RETORNO al cliente                           │
│          - id, nombre, email, tipo_usuario, is_active                       │
│          - NO incluye password_hash (seguridad)                             │
│                                                                             │
│        • Token           → Respuesta de login/registro                      │
│          - access_token                                                     │
│          - token_type ("bearer")                                            │
│          - user (UserResponse)                                              │
│                                                                             │
│  [ ] COMPONENTE 4.2: Schemas de Chaza                                       │
│      Archivo: app/schemas/chaza.py                                          │
│      Hace: Valida datos de chazas                                           │
│      Schemas:                                                               │
│        • ChazaCreate     → Qué necesito para CREAR chaza                    │
│          - titulo (obligatorio)                                             │
│          - descripcion (obligatorio)                                        │
│          - categoria (obligatorio)                                          │
│          - ubicacion (obligatorio)                                          │
│          - precio (opcional)                                                │
│          - duracion_estimada (opcional)                                     │
│                                                                             │
│        • ChazaUpdate     → Qué puedo MODIFICAR                              │
│          - Todos los campos son opcionales                                  │
│          - Solo actualiza los que envíes                                    │
│                                                                             │
│        • ChazaResponse   → Qué RETORNO al cliente                           │
│          - Todos los campos + owner_id + fechas                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Inspector de calidad que rechaza piezas defectuosas

---

## MÓDULO 5: LÓGICA DE NEGOCIO (Services)
**Función**: Reglas y procesos de la aplicación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 5: LÓGICA DE NEGOCIO                                                │
│  Función: Reglas y procesos de la aplicación                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 5.1: Servicio de Autenticación                              │
│      Archivo: app/services/auth_service.py                                  │
│      Hace: Procesos de registro y login                                     │
│      Métodos:                                                               │
│                                                                             │
│        • register_user(db, user_data)                                       │
│          1. ¿Email ya existe? → Error 400                                   │
│          2. Hashear password                                                │
│          3. Crear usuario en DB                                             │
│          4. Generar token JWT                                               │
│          5. Retornar token + usuario                                        │
│                                                                             │
│        • login_user(db, credentials)                                        │
│          1. Buscar usuario por email                                        │
│          2. ¿No existe? → Error 401                                         │
│          3. ¿Password incorrecta? → Error 401                               │
│          4. Generar token JWT                                               │
│          5. Retornar token + usuario                                        │
│                                                                             │
│  [ ] COMPONENTE 5.2: Servicio de Chazas                                     │
│      Archivo: app/services/chaza_service.py                                 │
│      Hace: CRUD completo de chazas                                          │
│      Métodos:                                                               │
│                                                                             │
│        • create_chaza(db, chaza_data, owner_id)                             │
│          1. ¿Usuario es chazero? → Si no, Error 403                         │
│          2. Crear chaza con owner_id                                        │
│          3. Guardar en DB                                                   │
│          4. Retornar chaza creada                                           │
│                                                                             │
│        • get_all_chazas(db, skip, limit, categoria, activas_solo)           │
│          1. Construir query con filtros                                     │
│          2. Aplicar paginación                                              │
│          3. Ordenar por más reciente                                        │
│          4. Retornar lista                                                  │
│                                                                             │
│        • get_chaza_by_id(db, chaza_id)                                      │
│          1. Buscar chaza por ID                                             │
│          2. ¿No existe? → Error 404                                         │
│          3. Retornar chaza                                                  │
│                                                                             │
│        • get_chazas_by_owner(db, owner_id)                                  │
│          1. Filtrar chazas donde owner_id = usuario                         │
│          2. Retornar lista                                                  │
│                                                                             │
│        • update_chaza(db, chaza_id, chaza_data, user_id)                    │
│          1. ¿Chaza existe? → Si no, Error 404                               │
│          2. ¿Usuario es dueño? → Si no, Error 403                           │
│          3. Actualizar campos enviados                                      │
│          4. Guardar en DB                                                   │
│          5. Retornar chaza actualizada                                      │
│                                                                             │
│        • delete_chaza(db, chaza_id, user_id)                                │
│          1. ¿Chaza existe? → Si no, Error 404                               │
│          2. ¿Usuario es dueño? → Si no, Error 403                           │
│          3. Marcar is_active = False (soft delete)                          │
│          4. Retornar confirmación                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Las líneas de producción con sus procesos y reglas

---

## MÓDULO 6: RUTAS/ENDPOINTS (API Pública)
**Función**: Ventanillas de atención al cliente

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO 6: RUTAS / ENDPOINTS                                                │
│  Función: Ventanillas de atención al cliente                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] COMPONENTE 6.1: Rutas de Autenticación                                 │
│      Archivo: app/api/routes/auth.py                                        │
│      Prefijo: /api/v1/auth                                                  │
│                                                                             │
│      ENDPOINTS:                                                             │
│      ┌─────────────────────────────────────────────────────────────────┐    │
│      │ [ ] POST /register                                              │    │
│      │     Auth: NO requerida                                          │    │
│      │     Recibe: {nombre, email, password, tipo_usuario}             │    │
│      │     Retorna: {access_token, token_type, user}                   │    │
│      │     Llama a: AuthService.register_user()                        │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] POST /login                                                 │    │
│      │     Auth: NO requerida                                          │    │
│      │     Recibe: {email, password}                                   │    │
│      │     Retorna: {access_token, token_type, user}                   │    │
│      │     Llama a: AuthService.login_user()                           │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] GET /me                                                     │    │
│      │     Auth: SÍ requerida (cualquier usuario)                      │    │
│      │     Recibe: Token JWT en header                                 │    │
│      │     Retorna: {id, nombre, email, tipo_usuario, ...}             │    │
│      │     Usa: get_current_user()                                     │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] GET /test                                                   │    │
│      │     Auth: NO requerida                                          │    │
│      │     Retorna: {message: "API funcionando", status: "OK"}         │    │
│      └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [ ] COMPONENTE 6.2: Rutas de Chazas                                        │
│      Archivo: app/api/routes/chazas.py                                      │
│      Prefijo: /api/v1/chazas                                                │
│                                                                             │
│      ENDPOINTS:                                                             │
│      ┌─────────────────────────────────────────────────────────────────┐    │
│      │ [ ] POST /                                                      │    │
│      │     Auth: SÍ requerida (SOLO chazeros)                          │    │
│      │     Recibe: {titulo, descripcion, categoria, ubicacion, ...}    │    │
│      │     Retorna: Chaza creada con ID y owner_id                     │    │
│      │     Llama a: ChazaService.create_chaza()                        │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] GET /                                                       │    │
│      │     Auth: NO requerida                                          │    │
│      │     Recibe: ?skip=0&limit=100&categoria=X&activas_solo=true     │    │
│      │     Retorna: Lista de chazas                                    │    │
│      │     Llama a: ChazaService.get_all_chazas()                      │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] GET /mis-chazas                                             │    │
│      │     Auth: SÍ requerida (SOLO chazeros)                          │    │
│      │     Recibe: Token JWT                                           │    │
│      │     Retorna: Lista de MIS chazas                                │    │
│      │     Llama a: ChazaService.get_chazas_by_owner()                 │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] GET /{chaza_id}                                             │    │
│      │     Auth: NO requerida                                          │    │
│      │     Recibe: ID de la chaza en la URL                            │    │
│      │     Retorna: Chaza específica                                   │    │
│      │     Llama a: ChazaService.get_chaza_by_id()                     │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] PUT /{chaza_id}                                             │    │
│      │     Auth: SÍ requerida (SOLO el dueño)                          │    │
│      │     Recibe: {campos a actualizar}                               │    │
│      │     Retorna: Chaza actualizada                                  │    │
│      │     Llama a: ChazaService.update_chaza()                        │    │
│      │     Verifica: owner_id == usuario actual                        │    │
│      ├─────────────────────────────────────────────────────────────────┤    │
│      │ [ ] DELETE /{chaza_id}                                          │    │
│      │     Auth: SÍ requerida (SOLO el dueño)                          │    │
│      │     Recibe: ID de la chaza en la URL                            │    │
│      │     Retorna: {message: "Chaza eliminada"}                       │    │
│      │     Llama a: ChazaService.delete_chaza()                        │    │
│      │     Nota: Es "soft delete" (is_active = false)                  │    │
│      └─────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Analogía Industrial**: Ventanillas de atención donde el cliente hace pedidos

---

## FLUJO VISUAL DE UNA PETICIÓN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO: CREAR UNA CHAZA                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ CLIENTE  │  POST /api/v1/chazas/
    │ (React)  │  Headers: Authorization: Bearer eyJ...
    └────┬─────┘  Body: {titulo, descripcion, ...}
         │
         ▼
    ┌──────────┐
    │ main.py  │  Recibe petición, busca ruta /chazas/
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ deps.py  │  get_current_chazero()
    │          │  → Decodifica JWT
    │          │  → Busca usuario en DB
    │          │  → ¿Es chazero? ✓
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ schemas  │  ChazaCreate valida:
    │ /chaza   │  → ¿titulo? ✓
    │          │  → ¿descripcion? ✓
    │          │  → ¿categoria? ✓
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ routes/  │  create_chaza() endpoint
    │ chazas   │  → Llama al servicio
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ services │  ChazaService.create_chaza()
    │ /chaza   │  → Crea objeto Chaza
    │          │  → Asigna owner_id
    │          │  → db.add() + db.commit()
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ session  │  Ejecuta INSERT SQL
    │ .py      │
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ SQLite   │  Guarda en chazas.db
    │ (DB)     │  Retorna ID generado
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ CLIENTE  │  Recibe JSON: {id, titulo, owner_id, ...}
    │ (React)  │  HTTP 201 Created
    └──────────┘
```

---

## DIAGRAMA DE ARCHIVOS

```
Back/
│
├── .env                          [M1] Variables secretas
├── app/
│   ├── config.py                 [M1] Lee .env
│   ├── main.py                   [M1] Arranca FastAPI
│   │
│   ├── core/
│   │   └── security.py           [M2] Hash + JWT
│   │
│   ├── api/
│   │   ├── deps.py               [M2] Middlewares/Guardias
│   │   └── routes/
│   │       ├── auth.py           [M6] Endpoints auth
│   │       └── chazas.py         [M6] Endpoints chazas
│   │
│   ├── database/
│   │   └── session.py            [M3] Conexión SQLite
│   │
│   ├── models/
│   │   ├── user.py               [M3] Tabla users
│   │   └── chaza.py              [M3] Tabla chazas
│   │
│   ├── schemas/
│   │   ├── user.py               [M4] Validación usuarios
│   │   └── chaza.py              [M4] Validación chazas
│   │
│   └── services/
│       ├── auth_service.py       [M5] Lógica autenticación
│       └── chaza_service.py      [M5] Lógica chazas
│
└── chazas.db                     [M3] Base de datos física
```

---

## CHECKLIST DE REVISIÓN

### MÓDULO 1: CONFIGURACIÓN
- [ ] Entiendo qué hay en .env
- [ ] Entiendo cómo config.py lee las variables
- [ ] Entiendo cómo main.py arranca todo

### MÓDULO 2: SEGURIDAD
- [ ] Entiendo cómo se hashean passwords
- [ ] Entiendo cómo se crea un JWT
- [ ] Entiendo cómo get_current_user() extrae el usuario del token

### MÓDULO 3: BASE DE DATOS
- [ ] Entiendo la conexión con session.py
- [ ] Entiendo el modelo User y sus columnas
- [ ] Entiendo el modelo Chaza y la relación owner_id

### MÓDULO 4: VALIDACIÓN
- [ ] Entiendo qué valida UserCreate
- [ ] Entiendo la diferencia entre Create, Update y Response
- [ ] Entiendo por qué Response NO incluye password

### MÓDULO 5: LÓGICA DE NEGOCIO
- [ ] Entiendo el flujo de register_user()
- [ ] Entiendo el flujo de login_user()
- [ ] Entiendo por qué solo chazeros pueden crear chazas
- [ ] Entiendo por qué solo el dueño puede editar/eliminar

### MÓDULO 6: ENDPOINTS
- [ ] Sé cuáles endpoints requieren autenticación
- [ ] Sé cuáles endpoints son solo para chazeros
- [ ] Probé todos los endpoints en Swagger UI

---

## CÓDIGOS DE ERROR COMUNES

| Código | Significado | Causa común |
|--------|-------------|-------------|
| 200 | OK | Todo bien |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos (validación falló) |
| 401 | Unauthorized | Sin token o token inválido |
| 403 | Forbidden | No tienes permiso (ej: estudiante creando chaza) |
| 404 | Not Found | Recurso no existe (ej: chaza_id incorrecto) |
| 422 | Validation Error | JSON mal formado o campos faltantes |
| 500 | Server Error | Error interno (revisar logs) |

---

## NOTAS PARA IMPRIMIR

Imprime este documento y:
1. Lee módulo por módulo
2. Abre el archivo correspondiente en VS Code
3. Marca con ✓ cuando entiendas cada componente
4. Prueba cada endpoint en Swagger UI
5. Anota dudas en los márgenes

---

**Autor**: Guía generada para el proyecto Chazas
**Fecha**: 2026-01-14
**Versión**: 1.0