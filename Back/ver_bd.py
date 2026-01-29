"""
Script para ver la estructura y contenido de la base de datos SQLite
"""
import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('chazas.db')
cursor = conn.cursor()

print("=" * 60)
print("   ESTRUCTURA DE LA BASE DE DATOS - chazas.db")
print("=" * 60)

# Ver todas las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tablas = cursor.fetchall()

print(f"\nTablas encontradas: {len(tablas)}")
for tabla in tablas:
    print(f"\n{'='*60}")
    print(f"TABLA: {tabla[0]}")
    print('='*60)

    # Ver estructura de cada tabla
    cursor.execute(f"PRAGMA table_info({tabla[0]})")
    columnas = cursor.fetchall()

    print("\nCOLUMNAS:")
    print(f"{'Nombre':<20} {'Tipo':<15} {'Not Null':<10} {'Primary Key'}")
    print("-" * 60)
    for col in columnas:
        nombre = col[1]
        tipo = col[2]
        not_null = "Sí" if col[3] else "No"
        pk = "Sí" if col[5] else "No"
        print(f"{nombre:<20} {tipo:<15} {not_null:<10} {pk}")

    # Contar registros
    cursor.execute(f"SELECT COUNT(*) FROM {tabla[0]}")
    count = cursor.fetchone()[0]
    print(f"\nNúmero de registros: {count}")

    # Mostrar algunos datos si hay
    if count > 0:
        cursor.execute(f"SELECT * FROM {tabla[0]} LIMIT 5")
        datos = cursor.fetchall()
        print(f"\nPrimeros {min(5, count)} registros:")
        for dato in datos:
            print(f"  {dato}")

print("\n" + "="*60)
print("FIN DEL REPORTE")
print("="*60)

conn.close()