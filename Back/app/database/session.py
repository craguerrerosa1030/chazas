"""
Configuración de la base de datos SQLAlchemy.
Actualmente usa SQLite, pero es FÁCIL migrar a PostgreSQL.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings


# Motor de base de datos
# Para SQLite: check_same_thread=False permite usar desde múltiples threads
# Para PostgreSQL: client_encoding=utf8 evita problemas de codificación
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"client_encoding": "utf8"}
    )

# Sesión de base de datos
# autocommit=False: Los cambios no se guardan automáticamente
# autoflush=False: No hace flush automático antes de cada query
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para los modelos
Base = declarative_base()


def get_db():
    """
    Dependencia para obtener una sesión de base de datos.
    Se usa con FastAPI Depends() para inyectar la sesión en las rutas.

    Yields:
        Session de SQLAlchemy

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializa la base de datos creando todas las tablas.
    Se debe llamar al inicio de la aplicación.
    """
    # Importar todos los modelos aquí para que SQLAlchemy los conozca
    from app.models import user, chaza, universidad, notificacion, solicitud, pending_registration

    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print(">> Base de datos inicializada correctamente")