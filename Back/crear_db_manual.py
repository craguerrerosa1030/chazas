"""
Script de ejemplo para crear una base de datos SQLite manualmente
"""
import sqlite3

# 1. Conectar (si no existe el archivo, se crea automáticamente)
conn = sqlite3.connect('mi_base_datos.db')
cursor = conn.cursor()

print(">> Base de datos 'mi_base_datos.db' creada")

# 2. Crear una tabla de ejemplo
cursor.execute('''
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        precio FLOAT,
        stock INTEGER,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
''')

print(">> Tabla 'productos' creada")

# 3. Insertar datos de ejemplo
cursor.execute('''
    INSERT INTO productos (nombre, precio, stock)
    VALUES ('Laptop', 999.99, 5)
''')

cursor.execute('''
    INSERT INTO productos (nombre, precio, stock)
    VALUES ('Mouse', 19.99, 50)
''')

# 4. Guardar cambios
conn.commit()
print(">> Datos insertados")

# 5. Consultar datos
cursor.execute('SELECT * FROM productos')
productos = cursor.fetchall()

print("\n--- Datos en la tabla ---")
for producto in productos:
    print(producto)

# 6. Cerrar conexión
conn.close()
print("\n>> Base de datos cerrada correctamente")
print("\nArchivo creado: mi_base_datos.db")