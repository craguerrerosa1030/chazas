# 📁 Estructura del Frontend - Chazas React

## 🏗️ Arquitectura Actual

```
Front/src/
│
├── 📄 index.js                      ← Punto de entrada (ReactDOM.render)
├── 📄 App.jsx                       ← Componente raíz
│
├── 📁 routes/                       ← 🛣️ Sistema de rutas
│   ├── AppRoutes.jsx                ← Configuración de todas las rutas
│   └── ProtectedRoute.jsx           ← Rutas que requieren autenticación
│
├── 📁 context/                      ← 🌐 Estado global
│   └── AuthContext.jsx              ← ⚠️ Autenticación (actualmente localStorage)
│
├── 📁 hooks/                        ← 🪝 Custom Hooks
│   ├── useAuth.js                   ← Hook para autenticación
│   └── useChazas.js                 ← Hook para chazas (vacío)
│
├── 📁 componentes/                  ← 🧩 Componentes reutilizables
│   ├── Header.jsx                   ← Navegación principal
│   ├── Navegacion.jsx               ← Menú de navegación
│   ├── Boton.jsx                    ← Botones reutilizables
│   ├── Modal.jsx                    ← Modal genérico
│   ├── Chazacard.jsx                ← Tarjeta de chaza
│   ├── ChazasGrid.jsx               ← Grid de chazas
│   ├── ChazaModal.jsx               ← Modal para crear chaza
│   ├── ChazaDetalleModal.jsx        ← Modal para ver detalles
│   ├── PropuestaCard.jsx            ← Tarjeta de propuesta
│   ├── BuscadorHorarios.jsx         ← Buscador de horarios
│   ├── FiltroHorarioModal.jsx       ← Modal de filtros
│   └── Styles.css                   ← Estilos globales
│
└── 📁 paginas/                      ← 📄 Páginas completas
    ├── Home.jsx                     ← Página de inicio
    ├── Login.jsx                    ← ⚠️ Login (localStorage)
    ├── Registro.jsx                 ← ⚠️ Registro (localStorage)
    ├── Dashboard.jsx                ← ⚠️ Dashboard (datos ficticios)
    ├── BuscarChazas.jsx             ← ⚠️ Buscar chazas (datos ficticios)
    ├── CrearChaza.jsx               ← Crear nueva chaza
    ├── MisChazas.jsx                ← Ver mis chazas
    └── MisPostulaciones.jsx         ← Ver mis postulaciones
```

## 🎯 Flujo de la Aplicación

```
Usuario ingresa a la app
    ↓
index.js (punto de entrada)
    ↓
App.jsx (componente raíz)
    ↓
<AuthProvider> (context global)
    ↓
<Header> (navegación)
    ↓
<AppRoutes> (sistema de rutas)
    ↓
    ├── Rutas públicas: /home, /login, /registro
    └── Rutas protegidas: /dashboard, /buscar-chazas, etc.
        ↓
    <ProtectedRoute> (verifica autenticación)
        ↓
    Componente de la página
```

## 🔑 Componentes Clave

### 1. **index.js** - Punto de entrada
```javascript
// Envuelve la app con <BrowserRouter>
<BrowserRouter>
  <App />
</BrowserRouter>
```

### 2. **App.jsx** - Componente raíz
```javascript
// Estructura básica:
<AuthProvider>          ← Context de autenticación
  <Header />            ← Navegación
  <main>
    <AppRoutes />       ← Sistema de rutas
  </main>
</AuthProvider>
```

### 3. **routes/AppRoutes.jsx** - Configuración de rutas
Define todas las rutas de la aplicación:
- Públicas: `/home`, `/login`, `/registro`
- Protegidas: `/dashboard`, `/buscar-chazas`, `/crear-chaza`, etc.

### 4. **routes/ProtectedRoute.jsx** - Protección de rutas
Verifica si el usuario está autenticado antes de permitir acceso.
Si no está autenticado → Redirige a `/login`

### 5. **context/AuthContext.jsx** - Estado de autenticación
**⚠️ ACTUALMENTE USA LOCALSTORAGE (FAKE)**

Funciones que provee:
- `login(email, password)` - Iniciar sesión
- `register(userData)` - Registrar usuario
- `logout()` - Cerrar sesión
- `isAuthenticated()` - Verificar si está logueado
- `isChazero()` / `isEstudiante()` - Verificar tipo de usuario
- `user` - Objeto del usuario actual

### 6. **paginas/Login.jsx & Registro.jsx**
Formularios que llaman a las funciones del AuthContext.

### 7. **paginas/Dashboard.jsx**
**⚠️ ACTUALMENTE TIENE DATOS FICTICIOS**

Muestra información diferente según tipo de usuario:
- **Estudiante**: Propuestas enviadas, trabajos próximos
- **Chazero**: Chazas activas, propuestas recibidas

---

## 🔌 PUNTOS DE CONEXIÓN CON EL BACKEND

### ⚠️ Estado Actual: SIN CONEXIÓN REAL

Actualmente el frontend está **completamente desconectado** del backend:
- Usa `localStorage` para simular base de datos
- Todos los datos son ficticios
- No hace peticiones HTTP

### ✅ Puntos que DEBEN conectarse al backend:

### 1. **AuthContext.jsx** (Archivo más importante)

**Ubicación**: `src/context/AuthContext.jsx`

**Funciones a modificar**:

```javascript
// ❌ ACTUAL (localStorage fake)
const register = async (userData) => {
  const users = getStoredUsers();  // localStorage
  // ... lógica fake
}

// ✅ DEBE SER (API real)
const register = async (userData) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();

  // Guardar token JWT
  localStorage.setItem('token', data.access_token);
  setUser(data.user);
}
```

**Endpoints del backend que necesita**:
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

---

### 2. **Dashboard.jsx**

**Ubicación**: `src/paginas/Dashboard.jsx`

**Actualmente**:
```javascript
// ❌ Datos ficticios hardcodeados
const usuario = {
  nombre: 'Juan Pérez',
  tipo: 'estudiante'
};
```

**Debe conectarse a**:
- `GET /api/v1/auth/me` - Obtener info del usuario
- `GET /api/v1/chazas/mis-chazas` - Si es chazero
- `GET /api/v1/propuestas/mis-propuestas` - Si es estudiante (futuro)

---

### 3. **BuscarChazas.jsx**

**Ubicación**: `src/paginas/Buscarchazas.jsx`

**Debe conectarse a**:
- `GET /api/v1/chazas/` - Obtener todas las chazas
- `GET /api/v1/chazas/?categoria=plomería` - Filtrar por categoría
- `GET /api/v1/chazas/{id}` - Ver detalles de una chaza

---

### 4. **CrearChaza.jsx**

**Ubicación**: `src/paginas/CrearChaza.jsx`

**Debe conectarse a**:
- `POST /api/v1/chazas/` - Crear nueva chaza (solo chazeros)

---

### 5. **MisChazas.jsx**

**Ubicación**: `src/paginas/MisChazas.jsx`

**Debe conectarse a**:
- `GET /api/v1/chazas/mis-chazas` - Obtener chazas del chazero
- `PUT /api/v1/chazas/{id}` - Editar una chaza
- `DELETE /api/v1/chazas/{id}` - Eliminar una chaza

---

## 📋 TABLA DE MAPEO: Frontend ↔ Backend

| Archivo Frontend | Función | Endpoint Backend | Método |
|-----------------|---------|------------------|--------|
| **AuthContext.jsx** | `register()` | `/api/v1/auth/register` | POST |
| **AuthContext.jsx** | `login()` | `/api/v1/auth/login` | POST |
| **AuthContext.jsx** | Obtener usuario | `/api/v1/auth/me` | GET |
| **Dashboard.jsx** | Cargar datos usuario | `/api/v1/auth/me` | GET |
| **BuscarChazas.jsx** | Listar chazas | `/api/v1/chazas/` | GET |
| **BuscarChazas.jsx** | Ver detalles | `/api/v1/chazas/{id}` | GET |
| **CrearChaza.jsx** | Crear chaza | `/api/v1/chazas/` | POST |
| **MisChazas.jsx** | Listar mis chazas | `/api/v1/chazas/mis-chazas` | GET |
| **MisChazas.jsx** | Editar chaza | `/api/v1/chazas/{id}` | PUT |
| **MisChazas.jsx** | Eliminar chaza | `/api/v1/chazas/{id}` | DELETE |

---

## 🎯 Próximos Pasos para Conectar

### Paso 1: Crear servicio de API
Crear archivo `src/services/api.js` con funciones para todas las peticiones HTTP.

### Paso 2: Modificar AuthContext
Reemplazar localStorage por peticiones reales a la API.

### Paso 3: Crear useChazas hook
Implementar el hook `useChazas.js` para manejar CRUD de chazas.

### Paso 4: Conectar páginas
Modificar Dashboard, BuscarChazas, CrearChaza, MisChazas para usar datos reales.

### Paso 5: Manejar autenticación JWT
- Guardar token en localStorage
- Incluir token en todas las peticiones protegidas
- Manejar expiración y renovación de token

---

## 🔒 Autenticación JWT - Cómo Funciona

```
1. Usuario hace login
   ↓
2. Backend devuelve JWT token
   ↓
3. Frontend guarda token en localStorage
   ↓
4. Cada petición incluye el token:
   headers: { 'Authorization': 'Bearer <token>' }
   ↓
5. Backend verifica token y devuelve datos
```

---

## 💡 Ventajas de la Estructura Actual

1. ✅ **Rutas bien organizadas** (React Router DOM)
2. ✅ **Context API para estado global** (AuthContext)
3. ✅ **Componentes reutilizables** (Chazacard, Modal, etc.)
4. ✅ **Separación de páginas y componentes**
5. ✅ **Rutas protegidas implementadas**

## ⚠️ Lo que falta

1. ❌ Conexión real con backend (actualmente todo fake)
2. ❌ Servicio de API (`src/services/api.js`)
3. ❌ Hook `useChazas` implementado
4. ❌ Manejo de errores HTTP
5. ❌ Loading states en peticiones
6. ❌ Tokens JWT persistentes

---

¿Quieres que empecemos a conectar el frontend con el backend? Podemos comenzar creando el servicio de API y modificando el AuthContext.