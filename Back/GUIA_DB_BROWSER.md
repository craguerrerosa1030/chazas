# Guía Completa de DB Browser for SQLite

## ¿Qué es DB Browser?

Es una herramienta **visual GRATUITA** para trabajar con bases de datos SQLite. Puedes hacer TODO sin escribir código SQL.

---

## Instalación

1. Ve a: https://sqlitebrowser.org/dl/
2. Descarga: **DB Browser for SQLite - Standard installer for 64-bit Windows**
3. Ejecuta el instalador
4. Click "Next, Next, Install"
5. ¡Listo!

---

## Capacidades - ¿Qué puedes hacer?

### ✅ Crear nuevas bases de datos

1. Abre DB Browser
2. Click en **"New Database"**
3. Elige ubicación y nombre (ejemplo: `mi_proyecto.db`)
4. Te pedirá crear la primera tabla → Haz click en "Cancel" si quieres crearla después

### ✅ Crear nuevas tablas

1. Abre tu base de datos (File → Open Database)
2. Click en **"Create Table"**
3. Llena el formulario:
   - **Table name**: nombre de la tabla (ejemplo: `productos`)
   - Click **"Add Field"** para agregar columnas

**Ejemplo de columnas**:
```
Nombre: id
Tipo: INTEGER
✓ Primary Key
✓ Autoincrement

Nombre: nombre
Tipo: TEXT
✓ Not Null

Nombre: precio
Tipo: REAL
```

4. Click **"OK"**
5. ¡Tabla creada!

### ✅ Modificar estructura de tablas

**IMPORTANTE**: SQLite tiene limitaciones para modificar tablas existentes.

**Lo que SÍ puedes hacer**:
- ✅ Agregar nuevas columnas
- ✅ Renombrar tablas
- ✅ Renombrar columnas (desde SQLite 3.25+)

**Lo que NO puedes hacer directamente**:
- ❌ Eliminar columnas (necesitas recrear la tabla)
- ❌ Cambiar tipo de dato de columna existente (necesitas recrear la tabla)
- ❌ Modificar restricciones (constraints) existentes

**Cómo modificar tablas en DB Browser**:

1. Click derecho en la tabla → **"Modify Table"**
2. Para **agregar columna**:
   - Click **"Add Field"**
   - Llena nombre y tipo
   - Click **"OK"**
3. Para **renombrar columna**:
   - Selecciona la columna
   - Cambia el nombre en el campo "Name"
   - Click **"OK"**

**Para eliminar columnas** (proceso manual):
1. Export la tabla a CSV (File → Export → Table as CSV)
2. Elimina la tabla (click derecho → Delete Table)
3. Crea nueva tabla sin esa columna
4. Importa los datos del CSV
5. (O usa SQL manual - ver abajo)

### ✅ Agregar/Editar/Eliminar FILAS (Registros)

**En la pestaña "Browse Data"**:

**Agregar nueva fila**:
1. Selecciona la tabla en el dropdown
2. Click en **"New Record"** (botón con +)
3. Haz doble click en cada celda para editar
4. Llena los datos
5. Click **"Write Changes"** (icono de diskette)

**Editar fila existente**:
1. Haz doble click en la celda que quieres cambiar
2. Edita el valor
3. Presiona Enter
4. Click **"Write Changes"**

**Eliminar fila**:
1. Selecciona la fila (click en el número de fila)
2. Click **"Delete Record"** (botón con X)
3. Click **"Write Changes"**

### ✅ Ejecutar SQL personalizado

**En la pestaña "Execute SQL"**:

```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Agregar usuario
INSERT INTO users (nombre, email, password_hash, tipo_usuario)
VALUES ('María García', 'maria@ejemplo.com', 'hash123', 'chazero');

-- Actualizar precio de una chaza
UPDATE chazas SET precio = 75.0 WHERE id = 1;

-- Eliminar un registro
DELETE FROM users WHERE id = 5;

-- Agregar columna nueva
ALTER TABLE users ADD COLUMN telefono VARCHAR(20);

-- Renombrar tabla
ALTER TABLE productos RENAME TO items;
```

### ✅ Importar/Exportar datos

**Exportar a CSV**:
1. File → Export → Table(s) as CSV
2. Selecciona la tabla
3. Elige ubicación
4. Click "OK"

**Importar desde CSV**:
1. File → Import → Table from CSV
2. Selecciona el archivo CSV
3. Mapea las columnas
4. Click "OK"

### ✅ Ver estructura de la base de datos

**En la pestaña "Database Structure"**:
- Ves todas las tablas
- Click en ▶ para expandir y ver columnas
- Ve índices, tipos de datos, claves primarias

---

## Limitaciones de SQLite (importantes)

### ❌ No puedes eliminar columnas directamente

**Solución**: Recrear la tabla

**Opción 1 - Con SQL en DB Browser**:
```sql
-- 1. Crear tabla temporal con columnas que quieres mantener
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(255),
    -- (no incluyes la columna que quieres eliminar)
);

-- 2. Copiar datos
INSERT INTO users_new SELECT id, nombre, email FROM users;

-- 3. Eliminar tabla vieja
DROP TABLE users;

-- 4. Renombrar tabla nueva
ALTER TABLE users_new RENAME TO users;
```

**Opción 2 - Con código (SQLAlchemy)**:
Usa migraciones Alembic (más avanzado).

### ❌ No puedes cambiar tipo de dato de columna

**Solución**: Misma que arriba - recrear la tabla.

### ✅ Puedes agregar columnas libremente

```sql
ALTER TABLE users ADD COLUMN fecha_nacimiento DATE;
ALTER TABLE chazas ADD COLUMN imagen_url VARCHAR(500);
```

---

## Casos de uso comunes

### Ver cuántos usuarios hay
```sql
SELECT COUNT(*) FROM users;
```

### Ver solo estudiantes
```sql
SELECT * FROM users WHERE tipo_usuario = 'estudiante';
```

### Ver chazas con precio mayor a $50
```sql
SELECT * FROM chazas WHERE precio > 50;
```

### Actualizar email de un usuario
```sql
UPDATE users SET email = 'nuevo@email.com' WHERE id = 1;
```

### Eliminar chazas completadas
```sql
DELETE FROM chazas WHERE is_completed = 1;
```

---

## Backup y restauración

### Hacer backup
Simplemente **copia el archivo `.db`** a otra ubicación:
```bash
copy chazas.db chazas_backup_2026-01-14.db
```

### Restaurar backup
Reemplaza el archivo `.db` actual con el backup.

---

## Advertencias importantes

### ⚠️ Siempre haz backup antes de modificar estructura

SQLite no tiene "UNDO" para cambios de estructura.

### ⚠️ Cierra el servidor antes de modificar manualmente

Si tienes el servidor FastAPI corriendo y modificas la DB manualmente, pueden haber conflictos.

**Recomendación**:
1. Detén el servidor (`Ctrl+C` en la ventana del servidor)
2. Modifica la DB en DB Browser
3. Reinicia el servidor

### ⚠️ Las restricciones de clave foránea (Foreign Keys) están DESACTIVADAS por defecto

Si quieres activarlas en DB Browser:
1. Edit → Preferences → SQL
2. ✓ Enable Foreign Keys

---

## Resumen rápido

| Acción | ¿Puedes hacerlo en DB Browser? |
|--------|-------------------------------|
| Crear nueva DB | ✅ Sí |
| Crear nueva tabla | ✅ Sí |
| Agregar columnas | ✅ Sí |
| Eliminar columnas | ⚠️ Manual (SQL) |
| Cambiar tipo de columna | ⚠️ Manual (SQL) |
| Renombrar tabla | ✅ Sí |
| Renombrar columna | ✅ Sí |
| Agregar filas | ✅ Sí |
| Editar filas | ✅ Sí |
| Eliminar filas | ✅ Sí |
| Ejecutar SQL | ✅ Sí |
| Importar CSV | ✅ Sí |
| Exportar CSV | ✅ Sí |

---

## Próximos pasos

1. Descarga DB Browser
2. Abre `chazas.db`
3. Explora la pestaña "Browse Data"
4. Prueba agregar un usuario manualmente
5. Prueba ejecutar un SELECT en "Execute SQL"