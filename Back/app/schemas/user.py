"""
Schemas de Usuario para validación con Pydantic.
Define qué datos se reciben y se envían en las peticiones HTTP.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """
    Schema para crear un usuario (registro).
    Datos que el frontend envía al backend.
    """
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo del usuario")
    email: EmailStr = Field(..., description="Email único del usuario")
    password: str = Field(..., min_length=6, max_length=100, json_schema_extra={"errorMessage": "La contraseña debe tener mínimo 6 caracteres"})
    tipo_usuario: str = Field(..., description="Tipo de usuario: 'estudiante' o 'chazero'")
    universidad_id: int = Field(..., description="ID de la universidad a la que pertenece")

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Juan Pérez",
                "email": "juan@unal.edu.co",
                "password": "mipassword123",
                "tipo_usuario": "estudiante",
                "universidad_id": 1
            }
        }


class UserLogin(BaseModel):
    """
    Schema para login de usuario.
    """
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña del usuario")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan@ejemplo.com",
                "password": "mipassword123"
            }
        }


class UniversidadSimpleForUser(BaseModel):
    """Schema simplificado de universidad para incluir en respuestas de usuario."""
    id: int
    nombre: str
    nombre_corto: str
    slug: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """
    Schema para respuesta de usuario.
    Datos que el backend envía al frontend (SIN password).
    """
    id: int
    nombre: str
    email: str
    tipo_usuario: str
    universidad_id: int
    universidad: Optional[UniversidadSimpleForUser] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Permite convertir modelos SQLAlchemy a Pydantic
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Juan Pérez",
                "email": "juan@unal.edu.co",
                "tipo_usuario": "estudiante",
                "universidad_id": 1,
                "universidad": {
                    "id": 1,
                    "nombre": "Universidad Nacional de Colombia",
                    "nombre_corto": "UNAL",
                    "slug": "unal"
                },
                "is_active": True,
                "is_verified": False,
                "created_at": "2026-01-13T10:30:00"
            }
        }


class Token(BaseModel):
    """
    Schema para respuesta de autenticación (token JWT).
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "nombre": "Juan Pérez",
                    "email": "juan@ejemplo.com",
                    "tipo_usuario": "estudiante",
                    "is_active": True,
                    "is_verified": False,
                    "created_at": "2026-01-13T10:30:00"
                }
            }
        }