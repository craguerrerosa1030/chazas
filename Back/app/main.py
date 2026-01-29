"""
Punto de entrada principal de la API de Chazas.
Configura FastAPI, CORS, rutas, y base de datos.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.session import init_db, SessionLocal
from app.api.routes import auth, chazas, uploads, universidades, notificaciones, solicitudes
from app.services.universidad_service import UniversidadService


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="API REST para la plataforma Chazas - Conectando estudiantes con oportunidades de trabajo",
    docs_url="/docs",  # Documentación interactiva en /docs
    redoc_url="/redoc"  # Documentación alternativa en /redoc
)


# Configurar CORS (permitir peticiones desde el frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Orígenes permitidos desde .env
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)


# Evento de inicio: Inicializar base de datos
@app.on_event("startup")
def on_startup():
    """
    Se ejecuta cuando la aplicación inicia.
    Crea las tablas en la base de datos si no existen.
    Crea universidades iniciales si no existen.
    """
    print(">> Iniciando API de Chazas...")
    init_db()

    # Crear universidades iniciales
    print(">> Verificando universidades...")
    db = SessionLocal()
    try:
        UniversidadService.seed_universidades_iniciales(db)
        print(">> Universidades verificadas/creadas")
    finally:
        db.close()

    print(">> API lista y funcionando")


# Incluir rutas
app.include_router(auth.router, prefix="/api/v1")
app.include_router(universidades.router, prefix="/api/v1")
app.include_router(chazas.router, prefix="/api/v1")
app.include_router(uploads.router, prefix="/api/v1")
app.include_router(notificaciones.router, prefix="/api/v1")
app.include_router(solicitudes.router, prefix="/api/v1")


# Ruta raíz
@app.get("/")
def root():
    """
    Endpoint raíz para verificar que la API está funcionando.
    """
    return {
        "message": "Bienvenido a la API de Chazas",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "status": "online"
    }


# Endpoint de salud (health check)
@app.get("/health")
def health_check():
    """
    Health check endpoint para monitoreo.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.API_VERSION
    }


if __name__ == "__main__":
    import uvicorn

    # Ejecutar servidor si se ejecuta directamente este archivo
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG  # Auto-reload en modo debug
    )