"""
Schemas de Chaza para validación con Pydantic.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


# === SCHEMAS DE HORARIOS ===

class HorarioTrabajoCreate(BaseModel):
    """Schema para crear un horario de trabajo."""
    dia_semana: int = Field(..., ge=0, le=6, description="Dia de la semana (0=Lunes, 6=Domingo)")
    hora_inicio: int = Field(..., ge=0, le=23, description="Hora de inicio (0-23)")
    hora_fin: int = Field(..., ge=0, le=23, description="Hora de fin (0-23)")

    @field_validator('hora_fin')
    @classmethod
    def validar_hora_fin(cls, v, info):
        if 'hora_inicio' in info.data and v <= info.data['hora_inicio']:
            raise ValueError('La hora de fin debe ser mayor que la hora de inicio')
        return v


class HorarioTrabajoResponse(BaseModel):
    """Schema para respuesta de horario de trabajo."""
    id: int
    dia_semana: int
    hora_inicio: int
    hora_fin: int
    activo: bool

    class Config:
        from_attributes = True


# === SCHEMAS DE CHAZA ===

class ChazaCreate(BaseModel):
    """
    Schema para crear una chaza.
    Datos que el frontend envia al backend.
    """
    titulo: str = Field(..., min_length=3, max_length=200, description="Nombre de la chaza")
    descripcion: str = Field(..., min_length=10, description="Descripcion de la chaza")
    categoria: str = Field(default="comida", description="Categoria de la chaza")
    precio: Optional[float] = Field(None, ge=0, description="Precio promedio (opcional)")
    ubicacion: str = Field(..., min_length=3, max_length=200, description="Ubicacion de la chaza")
    duracion_estimada: Optional[str] = Field(None, max_length=50, description="Horario de atencion")
    telefono: Optional[str] = Field(None, max_length=20, description="Telefono de contacto")
    imagen_url: Optional[str] = Field(None, max_length=500, description="URL de la imagen de la chaza")

    class Config:
        json_schema_extra = {
            "example": {
                "titulo": "Chaza Don Carlos",
                "descripcion": "La mejor comida casera cerca de la universidad",
                "categoria": "comida",
                "precio": 8000,
                "ubicacion": "Frente a la Universidad Nacional",
                "duracion_estimada": "6:00 - 20:00",
                "telefono": "300 123 4567",
                "imagen_url": "/api/v1/uploads/imagen/chaza_xxx.jpg"
            }
        }


class ChazaUpdate(BaseModel):
    """
    Schema para actualizar una chaza.
    Todos los campos son opcionales.
    """
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    descripcion: Optional[str] = Field(None, min_length=10)
    categoria: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    ubicacion: Optional[str] = Field(None, min_length=3, max_length=200)
    duracion_estimada: Optional[str] = Field(None, max_length=50)
    telefono: Optional[str] = Field(None, max_length=20)
    imagen_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class UniversidadSimpleForChaza(BaseModel):
    """Schema simplificado de universidad para incluir en respuestas de chaza."""
    id: int
    nombre: str
    nombre_corto: str
    slug: str

    class Config:
        from_attributes = True


class ChazaResponse(BaseModel):
    """
    Schema para respuesta de chaza.
    Datos que el backend envia al frontend.
    """
    id: int
    titulo: str
    slug: str
    descripcion: str
    categoria: str
    precio: Optional[float]
    ubicacion: str
    duracion_estimada: Optional[str]
    telefono: Optional[str]
    imagen_url: Optional[str]
    owner_id: int
    universidad_id: int
    universidad: Optional[UniversidadSimpleForChaza] = None
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime]
    horarios: List[HorarioTrabajoResponse] = []

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "titulo": "Chaza Don Carlos",
                "slug": "chaza-don-carlos",
                "descripcion": "La mejor comida casera cerca de la universidad",
                "categoria": "comida",
                "precio": 8000,
                "ubicacion": "Frente a la Universidad Nacional",
                "duracion_estimada": "6:00 - 20:00",
                "telefono": "300 123 4567",
                "imagen_url": "/api/v1/uploads/imagen/chaza_xxx.jpg",
                "owner_id": 1,
                "universidad_id": 1,
                "universidad": {
                    "id": 1,
                    "nombre": "Universidad Nacional de Colombia",
                    "nombre_corto": "UNAL",
                    "slug": "unal"
                },
                "is_active": True,
                "is_completed": False,
                "created_at": "2026-01-13T10:30:00",
                "updated_at": None,
                "horarios": []
            }
        }