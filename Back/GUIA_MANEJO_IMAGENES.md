# Guía Completa - Manejo de Imágenes en Backend

## ❓ El Problema

Los usuarios de tu app necesitarán subir imágenes:
- **Chazeros**: Foto de perfil, fotos de trabajos realizados
- **Estudiantes**: Foto de perfil
- **Chazas**: Fotos del trabajo a realizar

**¿Dónde guardas las imágenes?**

---

## 🎯 Opciones de Almacenamiento

### Opción 1: Guardar en la Base de Datos (BLOB) ❌ NO RECOMENDADO

**Cómo funciona**:
Guardas la imagen como datos binarios en una columna de tipo BLOB.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    foto BLOB  -- Aquí guardas los bytes de la imagen
)
```

**Ventajas**:
- ✅ Todo en un solo lugar (DB)
- ✅ Fácil hacer backup

**Desventajas**:
- ❌ Base de datos crece MUCHÍSIMO (una foto de 2MB = 2MB en la DB)
- ❌ Lento para consultar (tienes que cargar los bytes cada vez)
- ❌ No puedes usar CDN para servir imágenes rápido
- ❌ Difícil de escalar

**Veredicto**: ⚠️ Solo para imágenes MUY pequeñas o iconos. NO para fotos de usuarios.

---

### Opción 2: Guardar en el Servidor (Filesystem) ⚠️ OK para desarrollo

**Cómo funciona**:
Guardas las imágenes en una carpeta del servidor y guardas la RUTA en la base de datos.

```
chazas/
├── Back/
│   ├── uploads/              ← Carpeta nueva para imágenes
│   │   ├── usuarios/
│   │   │   ├── 1.jpg
│   │   │   ├── 2.png
│   │   └── chazas/
│   │       ├── 10.jpg
│   └── app/
```

**En la base de datos**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    foto_url VARCHAR(500)  -- Guardas "uploads/usuarios/1.jpg"
)
```

**Ventajas**:
- ✅ Fácil de implementar
- ✅ No llena la base de datos
- ✅ Gratis (usa tu propio servidor)

**Desventajas**:
- ❌ Si borras la carpeta, pierdes todas las fotos
- ❌ No escala bien (muchas imágenes = servidor lento)
- ❌ Difícil hacer backup separado
- ❌ Si usas múltiples servidores, necesitas sincronizar archivos
- ❌ En producción, necesitas configurar servicio de archivos estáticos

**Veredicto**: ✅ Perfecto para **desarrollo y MVP**, pero en producción usa Opción 3.

---

### Opción 3: Guardar en la Nube (Cloud Storage) ✅ RECOMENDADO

**Cómo funciona**:
Subes las imágenes a un servicio de almacenamiento en la nube y guardas la URL pública en la base de datos.

**Servicios populares**:
- **Cloudinary** (el más fácil, plan gratis generoso)
- **AWS S3** (más usado, escalable, plan gratis limitado)
- **Firebase Storage** (fácil, plan gratis bueno)
- **Supabase Storage** (gratis, fácil)

**En la base de datos**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    foto_url VARCHAR(500)  -- Guardas "https://cloudinary.com/chazas/user_1.jpg"
)
```

**Ventajas**:
- ✅ Escalable (millones de imágenes sin problema)
- ✅ CDN incluido (imágenes se sirven rápido en todo el mundo)
- ✅ Backup automático
- ✅ Redimensionamiento de imágenes automático (Cloudinary)
- ✅ No ocupas espacio en tu servidor
- ✅ Funciona con múltiples servidores sin problemas

**Desventajas**:
- ⚠️ Dependes de un servicio externo
- ⚠️ Plan gratis tiene límites (pero generosos)
- ⚠️ Requiere configuración inicial

**Veredicto**: ✅ **RECOMENDADO para producción**. Usa Cloudinary (es el más fácil).

---

## 📊 Comparativa Rápida

| Característica | BLOB (DB) | Filesystem (Servidor) | Cloud Storage |
|---------------|-----------|----------------------|---------------|
| **Facilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Velocidad** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Costo (MVP)** | Gratis | Gratis | Gratis* |
| **Backup** | Fácil | Manual | Automático |
| **CDN** | No | No | Sí |
| **Producción** | ❌ No | ⚠️ Limitado | ✅ Sí |

*Plan gratis de Cloudinary: 25GB, 25 créditos/mes (suficiente para miles de usuarios)

---

## 🎯 Recomendación para tu Proyecto

### Para DESARROLLO (ahora):
**Usa Filesystem (Opción 2)**

```python
# Estructura simple
uploads/
├── usuarios/
│   ├── 1_perfil.jpg
│   └── 2_perfil.png
└── chazas/
    ├── 10_trabajo.jpg
    └── 11_trabajo.png
```

### Para PRODUCCIÓN (cuando despliegues):
**Usa Cloudinary (Opción 3)**

```python
# Solo cambias la URL
# Antes: "/uploads/usuarios/1.jpg"
# Después: "https://res.cloudinary.com/chazas/image/upload/usuarios/1.jpg"
```

---

## 🚀 Implementación Rápida - Opción 2 (Filesystem)

Voy a mostrarte cómo implementar el filesystem para desarrollo.

### 1. Estructura de carpetas

```
Back/
├── uploads/           ← Nueva carpeta
│   ├── .gitkeep      ← Para que Git guarde la carpeta vacía
│   ├── usuarios/
│   └── chazas/
└── app/
    └── routes/
        └── upload.py  ← Nuevo endpoint para subir imágenes
```

### 2. Endpoint para subir imágenes

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload/imagen")
async def upload_imagen(
    file: UploadFile = File(...),
    tipo: str = "usuarios"  # "usuarios" o "chazas"
):
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Solo se permiten imágenes JPG, PNG, WEBP")

    # Validar tamaño (máximo 5MB)
    file.file.seek(0, 2)  # Ir al final
    file_size = file.file.tell()  # Obtener tamaño
    file.file.seek(0)  # Volver al inicio

    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(400, "La imagen no puede superar 5MB")

    # Generar nombre único
    extension = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{extension}"

    # Crear carpeta si no existe
    tipo_dir = UPLOAD_DIR / tipo
    tipo_dir.mkdir(exist_ok=True)

    # Guardar archivo
    file_path = tipo_dir / unique_name
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Retornar URL relativa
    return {
        "filename": unique_name,
        "url": f"/uploads/{tipo}/{unique_name}"
    }
```

### 3. Servir imágenes estáticas

```python
# En app/main.py
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### 4. Actualizar modelo de usuario

```python
# En app/models/user.py
class User(Base):
    # ... campos existentes
    foto_url = Column(String(500), nullable=True)
```

### 5. Uso desde el frontend

```javascript
// React - Subir imagen
async function subirFoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', 'usuarios');

  const response = await fetch('http://localhost:8000/api/v1/upload/imagen', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('URL de la imagen:', data.url);
  // Guarda data.url en el perfil del usuario
}

// Mostrar imagen
<img src={`http://localhost:8000${user.foto_url}`} alt="Perfil" />
```

---

## 🚀 Implementación Rápida - Opción 3 (Cloudinary)

### 1. Registro en Cloudinary

1. Ve a: https://cloudinary.com/
2. Click "Sign Up for Free"
3. Llena el formulario
4. Verifica tu email
5. Obtén tus credenciales:
   - Cloud Name
   - API Key
   - API Secret

### 2. Instalar dependencia

```bash
cd Back
venv/Scripts/pip install cloudinary
```

### 3. Configurar en `.env`

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Endpoint para subir a Cloudinary

```python
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File
import os

router = APIRouter()

# Configurar Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

@router.post("/upload/imagen")
async def upload_imagen_cloudinary(
    file: UploadFile = File(...),
    tipo: str = "usuarios"
):
    # Subir a Cloudinary
    result = cloudinary.uploader.upload(
        file.file,
        folder=f"chazas/{tipo}",  # Organizar en carpetas
        allowed_formats=["jpg", "png", "webp"],
        max_file_size=5000000  # 5MB
    )

    return {
        "url": result["secure_url"],  # URL pública
        "public_id": result["public_id"]
    }
```

### 5. Uso desde el frontend

```javascript
// React - Subir imagen
async function subirFoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', 'usuarios');

  const response = await fetch('http://localhost:8000/api/v1/upload/imagen', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('URL de Cloudinary:', data.url);
  // https://res.cloudinary.com/chazas/image/upload/v1234/chazas/usuarios/abc123.jpg
}

// Mostrar imagen (ya es URL completa)
<img src={user.foto_url} alt="Perfil" />
```

---

## 📝 Modificar la Base de Datos para Imágenes

### Para usuarios (foto de perfil):

```sql
-- Agregar columna foto_url
ALTER TABLE users ADD COLUMN foto_url VARCHAR(500);
```

### Para chazas (fotos del trabajo):

**Opción A: Una sola foto**
```sql
ALTER TABLE chazas ADD COLUMN foto_url VARCHAR(500);
```

**Opción B: Múltiples fotos** (Recomendado)
```sql
-- Crear tabla nueva para múltiples imágenes
CREATE TABLE chaza_imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chaza_id INTEGER NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chaza_id) REFERENCES chazas(id) ON DELETE CASCADE
);

-- Ahora una chaza puede tener múltiples fotos
-- Ejemplo: chaza #5 tiene 3 fotos
-- id=1, chaza_id=5, imagen_url="url1.jpg", orden=1
-- id=2, chaza_id=5, imagen_url="url2.jpg", orden=2
-- id=3, chaza_id=5, imagen_url="url3.jpg", orden=3
```

---

## 🎯 Mi Recomendación Final

### Fase 1 - MVP (Ahora):
1. Usa **Filesystem (Opción 2)** para desarrollo
2. Solo permite **1 foto de perfil por usuario**
3. Permite **hasta 5 fotos por chaza**

### Fase 2 - Producción:
1. Migra a **Cloudinary (Opción 3)**
2. Solo cambias el endpoint de upload
3. El frontend NO cambia (sigue usando URLs)

---

## 🔧 ¿Qué implementamos ahora?

**Te recomiendo**:
1. Agregar columna `foto_url` a tabla `users`
2. Crear carpeta `uploads/`
3. Implementar endpoint básico para subir imágenes
4. Probar con Swagger UI

**¿Quieres que implemente esto ahora o prefieres probarlo tú primero?**

---

## 📚 Resumen

| Pregunta | Respuesta |
|----------|-----------|
| **¿Dónde guardar imágenes?** | Filesystem (desarrollo), Cloudinary (producción) |
| **¿Qué guardo en la DB?** | Solo la URL, no la imagen |
| **¿Cuántas fotos por chaza?** | Hasta 5 (tabla separada) |
| **¿Límite de tamaño?** | 5MB por imagen |
| **¿Formatos permitidos?** | JPG, PNG, WEBP |
| **¿CDN necesario?** | No para desarrollo, sí para producción |
| **¿Servicio recomendado?** | Cloudinary (fácil, plan gratis generoso) |

¿Quieres que implemente alguna de estas opciones ahora?