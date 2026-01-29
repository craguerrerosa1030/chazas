"""
Configuración global de la aplicación.
Lee las variables de entorno desde el archivo .env
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Configuraciones de la aplicación.
    Pydantic automáticamente lee del archivo .env
    """
    # Info de la app
    APP_NAME: str = "Chazas API"
    DEBUG: bool = True
    API_VERSION: str = "v1"

    # Base de datos
    DATABASE_URL: str = "sqlite:///./chazas.db"

    # Seguridad JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas

    # Configuración SMTP para verificación de email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Chazas"
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 15

    # CORS - Lista de orígenes permitidos
    CORS_ORIGINS: str = "http://localhost:3000"

    # Puerto
    PORT: int = 8000

    # Cloudinary - Almacenamiento de imágenes
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Convierte el string de CORS_ORIGINS en una lista"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Instancia global de configuración
settings = Settings()